from typing import List,Optional
from pydantic import BaseModel, Field

class GenerateQuizRequest(BaseModel):
    topic: str = Field(min_length=1)
    question_type: str
    difficulty: str
    num_questions: int = Field(ge=1, le=10)

class PublicQuestion(BaseModel):
    id: int
    type: str
    question: str
    options: List[str] = []

class GenerateQuizResponse(BaseModel):
    session_id: str
    topic: str
    question_type: str
    difficulty: str
    num_questions: int
    questions: List[PublicQuestion]

class SubmittedAnswer(BaseModel):
    question_id: int
    answer: str

class SubmitQuizRequest(BaseModel):
    session_id: str
    answers: List[SubmittedAnswer]

class QuestionResult(BaseModel):
    question_number: int
    question: str
    question_type: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    options: List[str] = []

class SubmitQuizResponse(BaseModel):
    session_id: str
    score_porcentage: float
    correct_count: int
    incorrect_count: int
    total_questions: int
    results: List[QuestionResult]

    