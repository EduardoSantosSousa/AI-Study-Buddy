from datetime import datetime
import json
import os 
import sqlite3

RESULTS_DIR = "results"
DATABASE_PATH = os.path.join(RESULTS_DIR, "study_buddy.db")

def get_connection():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db():
    with get_connection() as connection:
        connection.execute("""CREATE TABLE IF NOT EXISTS quiz_sessions (
                           session_id TEXT PRIMARY KEY,
                           created_at TEXT NOT NULL,
                           config_json TEXT NOT NULL,
                           questions_json TEXT NOT NULL)"""
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS quiz_results(
            session_id TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            topic TEXT NOT NULL,
            question_type TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            num_questions INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            incorrect_count INTEGER NOT NULL,
            score_percentage REAL NOT NULL
            )
            """
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS question_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            question_number INTEGER NOT NULL,
            question TEXT NOT NULL,
            question_type TEXT NOT NULL,
            user_answer TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            options_json TEXT NOT NULL
            )
            """
        )

init_db()

def create_session(session_id: str, payload: dict):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR REPLACE INTO quiz_sessions (
            session_id,
            created_at,
            config_json,
            questions_json
            )
            VALUES (?,?,?,?)
            """,
            (
                session_id,
                datetime.now().isoformat(timespec="seconds"),
                json.dumps(payload["config"]),
                json.dumps(payload["questions"]),
            ),
        )

def get_session(session_id: str):
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT config_json, questions_json
            FROM quiz_sessions
            WHERE session_id = ?
            """,
            (session_id,),

        ).fetchone()

    if row is None:
        return None
    
    return{
        "config": json.loads(row["config_json"]),
        "questions":json.loads(row["questions_json"]),
    }


def save_session_results(session_id: str, config: dict, results: list[dict]):
    total = len(results)
    correct = sum( 1 for item in results if item["is_correct"])
    score = round((correct/total)*100, 2) if total else 0
    created_at = datetime.now().isoformat(timespec="seconds")

    with get_connection() as connection:
        connection.execute(
            """
            DELETE FROM quiz_results
            WHERE session_id = ?
            """,
            (session_id,),
        )

        connection.execute(
            """
            DELETE FROM question_results
            WHERE session_id = ?
            """,
            (session_id,),
        )

        connection.execute(
            """
            INSERT INTO quiz_results(
            session_id,
            created_at,
            topic,
            question_type,
            difficulty,
            num_questions,
            correct_count,
            incorrect_count,
            score_percentage
            )
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            (
                session_id,
                created_at,
                config["topic"],
                config["question_type"],
                config["difficulty"],
                config["num_questions"],
                correct,
                total - correct,
                score
            ),
        )

        connection.executemany(
            """
            INSERT INTO question_results(
            session_id,
            question_number,
            question,
            question_type,
            user_answer,
            correct_answer,
            is_correct,
            options_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    session_id,
                    item["question_number"],
                    item["question"],
                    item["question_type"],
                    item["user_answer"],
                    item["correct_answer"],
                    int(item["is_correct"]),
                    json.dumps(item.get("options", [])),
                )
                for item in results
            ],
        )
    
    return{
        "session_id": session_id,
        "score_percentage": score,
        "correct_count": correct,
        "incorrect_count": total - correct,
        "total_questions": total,
    }

def get_all_sessions():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                session_id,
                created_at,
                topic,
                question_type,
                difficulty,
                num_questions,
                correct_count,
                incorrect_count,
                score_percentage
            FROM quiz_results
            ORDER BY created_at DESC    
            """
        ).fetchall()

    return [dict(row) for row in rows]    


def get_session_results(session_id: str):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                question_number,
                question,
                question_type,
                user_answer,
                correct_answer,
                is_correct,
                options_json
            FROM question_results
            WHERE session_id = ?
            ORDER BY question_number ASC    
            """,
            (session_id,),
        ).fetchall()

    results = []

    for row in rows:
        item =dict(row)
        item["is_correct"] = bool(item["is_correct"])
        item["options"] = json.loads(item.pop("options_json"))
        results.append(item)

    return results


def get_analytics_summary():
    sessions = get_all_sessions()

    if not sessions:
        return{
            "total_quizzes": 0,
            "average_score": 0,
            "best_score": 0,
            "favorite_topic": None,
            "sessions": [],
        }
    
    total_quizzes = len(sessions)
    scores = [session["score_percentage"] for session in sessions]
    topics = [session["topic"] for session in sessions]
    favorite_topic = max(set(topics), key=topics.count) if topics else None 

    return{
        "total_quizzes": total_quizzes,
        "average_score": round(sum(scores) / total_quizzes, 2),
        "best_score": max(scores),
        "favorite_topic": favorite_topic,
        "sessions": sessions,
    }

