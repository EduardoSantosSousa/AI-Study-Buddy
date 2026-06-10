from langchain_core.output_parsers import PydanticOutputParser
from src.models.question_schemas import MCQQuestion, FillBlankQuestion
from src.prompts.templates import mcq_prompt_template, fill_blank_prompt_template
from src.llm.groq_client import get_groq_llm
from src.config.settings import settings
from src.common.logger import get_logger
from src.common.custom_exception import CustomException

class QuestionGenerator:
    def __init__(self):
        self.llm = get_groq_llm()
        self.logger = get_logger(self.__class__.__name__)

    def _retry_and_parse(self, prompt, parser, topic, difficulty, existing_questions=None):
        existing_questions_text = self._format_existing_questions(existing_questions or [])

        for attempt in range(settings.MAX_RETRIES):
            try:
                self.logger.info(f"Generating question for topic {topic} with difficulty {difficulty}")

                response = self.llm.invoke(
                    prompt.format(
                        topic=topic,
                        difficulty=difficulty,
                        existing_questions=existing_questions_text,
                    )
                )

                parsed = parser.parse(response.content)

                self.logger.info("Sucessfully parsed the question ")
                return parsed

            except Exception as e: 
                self.logger.error(f"Error coming: {str(e)}")
                if attempt == settings.MAX_RETRIES-1:
                    raise CustomException(f"Generation failed after {settings.MAX_RETRIES} attempts", e)

    def _format_existing_questions(self, existing_questions):
        if not existing_questions:
            return "None yet."

        return "\n".join(
            f"{index + 1}. {question}"
            for index, question in enumerate(existing_questions)
        )

    def generate_mcq(self, topic:str, difficulty:str="medium", existing_questions=None) -> MCQQuestion:
        try:
            parser = PydanticOutputParser(pydantic_object=MCQQuestion)

            question = self._retry_and_parse(
                mcq_prompt_template,
                parser,
                topic,
                difficulty,
                existing_questions,
            )

            if len(question.options) != 4 or question.correct_answer not in question.options:
                raise ValueError("invalid MCQ Structure")

            self.logger.info("Generated a valid MCQ Question")

            return question
        
        except Exception as e :
            self.logger.error(f"Failed to generate MCQ : {str(e)}")
            raise CustomException("MCQ generation failed", e )
        
    def generate_fill_blank(self, topic:str, difficulty:str="medium", existing_questions=None) -> FillBlankQuestion:
        try:
            parser = PydanticOutputParser(pydantic_object=FillBlankQuestion)

            question = self._retry_and_parse(
                fill_blank_prompt_template,
                parser,
                topic,
                difficulty,
                existing_questions,
            )

            if "______" not in question.question:
                raise ValueError("Fill in blanks should contain '____'")


            self.logger.info("Generated a valid Fill in Blanks Question")

            return question
        
        except Exception as e :
            self.logger.error(f"Failed to generate MCQ : {str(e)}")
            raise CustomException("Fill in blanks generation failed", e )     













