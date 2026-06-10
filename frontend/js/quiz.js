let quiz = null;
let currentQuestionIndex = 0;
let answers = {};

document.addEventListener("DOMContentLoaded", () => {
  const storedQuiz = sessionStorage.getItem("studyBuddyCurrentQuiz");
  const storedAnswers = sessionStorage.getItem("studyBuddyAnswers");

  if (!storedQuiz) {
    renderEmptyQuizState();
    return;
  }

  quiz = JSON.parse(storedQuiz);
  answers = storedAnswers ? JSON.parse(storedAnswers) : {};

  document.getElementById("previousButton").addEventListener("click", goToPreviousQuestion);
  document.getElementById("nextButton").addEventListener("click", goToNextQuestion);
  document.getElementById("submitQuizButton").addEventListener("click", submitCurrentQuiz);

  const submitQuizMobileButton = document.getElementById("submitQuizMobileButton");
  if (submitQuizMobileButton) {
    submitQuizMobileButton.addEventListener("click", submitCurrentQuiz);
  }

  renderQuizHeader();
  renderCurrentQuestion();
});

function renderQuizHeader() {
  document.getElementById("quizTitle").textContent = `${quiz.topic} Quiz`;
  document.getElementById("quizSubtitle").textContent = `${quiz.difficulty} - ${quiz.question_type}`;
  document.getElementById("quizTutorTip").textContent =
    `This ${quiz.difficulty.toLowerCase()} quiz focuses on ${quiz.topic}. Review each answer before submitting.`;
  document.getElementById("quizTotalQuestions").textContent = quiz.questions.length;
}

function renderEmptyQuizState() {
  document.getElementById("quizTitle").textContent = "My Quizzes";
  document.getElementById("quizSubtitle").textContent = "Create a new quiz from the dashboard to start studying.";
  document.getElementById("questionProgressText").textContent = "";
  document.getElementById("questionProgressBar").style.width = "0%";
  document.getElementById("questionNumber").textContent = "";
  document.getElementById("questionText").textContent = "No active quiz found.";

  const answerContainer = document.getElementById("answerContainer");
  answerContainer.innerHTML = `
    <button class="w-full py-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary-container transition-all active:scale-[0.98]" type="button">
      Start New Quiz
    </button>
  `;

  answerContainer.querySelector("button").addEventListener("click", () => {
    window.location.href = "/dashboard";
  });

  document.getElementById("quizNavigation").classList.add("hidden");
  document.getElementById("submitQuizMobileButton").classList.add("hidden");
  document.getElementById("learningAidSection").classList.add("hidden");
}

function renderCurrentQuestion() {
  const question = quiz.questions[currentQuestionIndex];
  const total = quiz.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / total) * 100;

  document.getElementById("questionProgressText").textContent =
    `Question ${currentQuestionIndex + 1} of ${total}`;

  document.getElementById("questionProgressBar").style.width = `${progressPercentage}%`;
  document.getElementById("questionNumber").textContent = currentQuestionIndex + 1;
  document.getElementById("questionText").textContent = question.question;

  const answerContainer = document.getElementById("answerContainer");
  answerContainer.innerHTML = "";

  if (question.type === "MCQ") {
    renderMultipleChoice(question, answerContainer);
  } else {
    renderFillBlank(question, answerContainer);
  }

  document.getElementById("previousButton").disabled = currentQuestionIndex === 0;
  document.getElementById("nextButton").disabled = currentQuestionIndex === total - 1;
}

function renderMultipleChoice(question, container) {
  question.options.forEach((option) => {
    const label = document.createElement("label");
    label.className = "group relative flex items-center p-5 rounded-2xl border-2 border-outline-variant hover:border-secondary/40 hover:bg-secondary-fixed/10 transition-all cursor-pointer";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "quiz-option";
    input.value = option;
    input.checked = answers[question.id] === option;
    input.className = "hidden peer";
    input.addEventListener("change", () => {
      answers[question.id] = option;
      persistAnswers();
      if (typeof showFeedback === "function") {
        showFeedback();
      }
    });

    const marker = document.createElement("div");
    marker.className = "w-6 h-6 rounded-full border-2 border-outline peer-checked:border-secondary peer-checked:bg-secondary flex items-center justify-center transition-all";
    marker.innerHTML = '<div class="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>';

    const span = document.createElement("span");
    span.className = "ml-4 font-body-lg text-body-lg text-on-surface peer-checked:text-primary peer-checked:font-bold";
    span.textContent = option;

    const ring = document.createElement("div");
    ring.className = "absolute inset-0 rounded-2xl peer-checked:border-secondary peer-checked:ring-2 peer-checked:ring-secondary/20 pointer-events-none";

    label.appendChild(input);
    label.appendChild(marker);
    label.appendChild(span);
    label.appendChild(ring);
    container.appendChild(label);
  });
}

function renderFillBlank(question, container) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = answers[question.id] || "";
  input.placeholder = "Type your answer";
  input.className = "w-full px-4 py-4 rounded-xl border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-body-md text-body-md";

  input.addEventListener("input", () => {
    answers[question.id] = input.value;
    persistAnswers();
  });

  container.appendChild(input);
}

function goToPreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    renderCurrentQuestion();
  }
}

function goToNextQuestion() {
  if (currentQuestionIndex < quiz.questions.length - 1) {
    currentQuestionIndex += 1;
    renderCurrentQuestion();
  }
}

function persistAnswers() {
  sessionStorage.setItem("studyBuddyAnswers", JSON.stringify(answers));
}

async function submitCurrentQuiz() {
  const missingQuestions = quiz.questions.filter((question) => {
    return !String(answers[question.id] || "").trim();
  });

  if (missingQuestions.length > 0) {
    alert("Please answer all questions before submitting.");
    return;
  }

  const payload = {
    session_id: quiz.session_id,
    answers: quiz.questions.map((question) => ({
      question_id: question.id,
      answer: answers[question.id]
    }))
  };

  try {
    const results = await submitQuiz(payload);
    sessionStorage.setItem("studyBuddyResults", JSON.stringify(results));
    window.location.href = "/results";
  } catch (error) {
    alert(error.message);
  }
}
