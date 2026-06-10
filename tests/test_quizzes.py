from fastapi.testclient import TestClient

from backend.app import app

client = TestClient(app)


def test_generate_quiz():
    response = client.post(
        "/api/quizzes/generate",
        json={
            "topic": "Python",
            "question_type": "Multiple Choice",
            "difficulty": "Easy",
            "num_questions": 1,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert "session_id" in data
    assert len(data["questions"]) == 1
    assert "correct_answer" not in data["questions"][0]


def test_submit_unknown_session():
    response = client.post(
        "/api/quizzes/submit",
        json={
            "session_id": "sessao-inexistente",
            "answers": [],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Quiz session not found"


def test_generate_and_submit_quiz():
    generate_response = client.post(
        "/api/quizzes/generate",
        json={
            "topic": "Python",
            "question_type": "Multiple Choice",
            "difficulty": "Easy",
            "num_questions": 1,
        },
    )

    assert generate_response.status_code == 200
    quiz = generate_response.json()

    submit_response = client.post(
        "/api/quizzes/submit",
        json={
            "session_id": quiz["session_id"],
            "answers": [
                {
                    "question_id": quiz["questions"][0]["id"],
                    "answer": quiz["questions"][0]["options"][0],
                }
            ],
        },
    )

    assert submit_response.status_code == 200
    result = submit_response.json()

    assert result["total_questions"] == 1
    assert result["correct_count"] + result["incorrect_count"] == 1
