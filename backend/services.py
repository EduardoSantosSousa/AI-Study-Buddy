from datetime import datetime
from difflib import SequenceMatcher
import re

from src.config.settings import settings
from src.generator.question_generator import QuestionGenerator

SIMILARITY_THRESHOLD = 0.86


def normalize_question_text(question: str) -> str:
    normalized = question.lower().strip()
    normalized = re.sub(r"[^a-z0-9\s]", "", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized


def is_duplicate_question(candidate: str, existing_questions: list[dict]) -> bool:
    normalized_candidate = normalize_question_text(candidate)

    for existing in existing_questions:
        normalized_existing = normalize_question_text(existing["question"])

        if normalized_candidate == normalized_existing:
            return True

        similarity = SequenceMatcher(
            None,
            normalized_candidate,
            normalized_existing,
        ).ratio()

        if similarity >= SIMILARITY_THRESHOLD:
            return True

    return False


def generate_quiz_questions(topic: str, question_type: str, difficulty: str, num_questions: int):
    generator = QuestionGenerator()
    questions = []
    max_unique_attempts = max(settings.MAX_RETRIES * 3, num_questions * 2)

    for index in range(num_questions):
        generated = None

        for _ in range(max_unique_attempts):
            existing_question_texts = [
                question["question"]
                for question in questions
            ]

            if question_type == "Multiple Choice":
                generated = generator.generate_mcq(
                    topic,
                    difficulty.lower(),
                    existing_questions=existing_question_texts,
                )

                if is_duplicate_question(generated.question, questions):
                    continue

                questions.append({
                    "id": index + 1,
                    "type": "MCQ",
                    "question": generated.question,
                    "options": generated.options,
                    "correct_answer": generated.correct_answer,
                })
                break

            if question_type == "Fill in the Blank":
                generated = generator.generate_fill_blank(
                    topic,
                    difficulty.lower(),
                    existing_questions=existing_question_texts,
                )

                if is_duplicate_question(generated.question, questions):
                    continue

                questions.append({
                    "id": index + 1,
                    "type": "Fill in the blank",
                    "question": generated.question,
                    "options": [],
                    "correct_answer": generated.answer,
                })
                break

            raise ValueError(f"Unsupported question type: {question_type}")

        if generated is None or len(questions) != index + 1:
            raise ValueError(
                "Could not generate enough unique questions. Try a broader topic or fewer questions."
            )

    session_id = datetime.now().strftime("%Ym%d_%H%M%S_%f")
    return session_id, questions


def build_public_questions(questions: list[dict]):
    public_questions = []

    for question in questions:
        public_questions.append({
            "id": question["id"],
            "type": question["type"],
            "question": question["question"],
            "options": question.get("options", []),
        })

    return public_questions


def evaluate_quiz(questions: list[dict], answers: list[dict]):
    answers_by_id = {
        item["question_id"]: item["answer"]
        for item in answers
    }

    results = []

    for index, question in enumerate(questions):
        question_id = question["id"]
        user_answer = answers_by_id.get(question_id, "")
        correct_answer = question["correct_answer"]

        if question["type"] == "MCQ":
            is_correct = user_answer == correct_answer
        else:
            is_correct = user_answer.strip().lower() == correct_answer.strip().lower()

        results.append({
            "question_number": index + 1,
            "question": question["question"],
            "question_type": question["type"],
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "options": question.get("options", []),
        })

    return results
