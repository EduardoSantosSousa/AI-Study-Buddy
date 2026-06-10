import csv
from io import StringIO

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from backend.schemas import GenerateQuizRequest, SubmitQuizRequest
from backend.services import generate_quiz_questions, build_public_questions, evaluate_quiz
from backend.storage import (create_session, get_all_sessions, get_analytics_summary, get_session, get_session_results, save_session_results)

load_dotenv()

app = FastAPI(title="Study Buddy AI API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)
app.mount("/js", StaticFiles(directory="frontend/js"), name="js")
app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")
templates = Jinja2Templates(directory="frontend/templates")

@app.get("/")
def root():
    return RedirectResponse(url="/dashboard")

@app.get("/dashboard")
@app.get("/dashboard_page.html")
def dashboard_page(request: Request):
    return templates.TemplateResponse(request, "dashboard_page.html")

@app.get("/quiz")
@app.get("/quiz_page.html")
def quiz_page(request: Request):
    return templates.TemplateResponse(request, "quiz_page.html")

@app.get("/results")
@app.get("/results_page.html")
def results_page(request: Request):
    return templates.TemplateResponse(request, "results_page.html")

@app.get("/performance")
@app.get("/performance_page.html")
def performance_page(request: Request):
    return templates.TemplateResponse(request, "performance_page.html")

@app.get("/api/health")
def health_check():
    return {"status":"ok", "app":"Study Buddy AI"}

@app.post("/api/quizzes/generate")
def generate_quiz(payload:GenerateQuizRequest):
    try:
        session_id, questions = generate_quiz_questions(topic=payload.topic, question_type=payload.question_type,
                                                         difficulty=payload.difficulty, num_questions=payload.num_questions,)
        create_session(session_id, {
            "config":payload.model_dump(),
            "questions":questions,
        })

        return{
            "session_id":session_id,
            "topic":payload.topic,
            "question_type":payload.question_type,
            "difficulty": payload.difficulty,
            "num_questions":payload.num_questions,
            "questions":build_public_questions(questions)
        }
    
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/api/quizzes/submit")
def submit_quiz(payload: SubmitQuizRequest):
    session = get_session(payload.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    answers = [item.model_dump() for item in payload.answers]
    results = evaluate_quiz(session["questions"], answers)

    total = len(results)
    correct = sum (1 for item in results if item["is_correct"])
    score = round((correct/total)*100, 2) if total else 0

    save_session_results(session_id=payload.session_id, config=session["config"], results=results)

    return {
        "session_id":payload.session_id,
        "score_percentage":score,
        "correct_count":correct,
        "incorrect_count": total - correct,
        "total_questions":total,
        "results": results,
    }

@app.get("/api/analytics/summary")
def analytics_summary():
    return get_analytics_summary()

@app.get("/api/exports/session/{session_id}.csv")
def export_session_csv(session_id: str):
    rows = get_session_results(session_id)

    if not rows:
        raise HTTPException(status_code=404, detail="Session results not found")
    
    buffer = StringIO()
    fieldnames = [
        "question_number",
        "question",
        "question_type",
        "user_answer",
        "correct_answer",
        "is_correct",
        "options",
    ]

    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    buffer.seek(0)

    return StreamingResponse(iter([buffer.getvalue()]), media_type="text/csv", headers={
        "Content-Disposition": f"attachment; filename=quiz_results_{session_id}.csv"
        },)

@app.get("/api/exports/all.csv")
def export_all_csv():
    rows = get_all_sessions()

    if not rows:
        raise HTTPException(status_code=404, detail="No analytics data found")

    buffer = StringIO()
    fieldnames = [
        "session_id",
        "created_id",
        "topic",
        "question_type",
        "difficulty",
        "num_questions",
        "correct_count",
        "incorrect_count",
        "score_percentage",
    ]

    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":"attachment; filename=study_buddy_sessions.csv"
        },
    )    
