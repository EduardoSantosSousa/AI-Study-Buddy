let selectedDifficulty = "Medium";

document.addEventListener("DOMContentLoaded", () => {
  const range = document.getElementById("questionRange");
  const display = document.getElementById("questionCountDisplay");
  const generateButton = document.getElementById("generateQuizButton");
  const message = document.getElementById("dashboardMessage");
  const difficultyButtons = document.querySelectorAll(".difficulty-option");

  renderRecentActivities();

  if (range && display) {
    range.addEventListener("input", () => {
      display.textContent = range.value;
    });
  }

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedDifficulty = button.dataset.difficulty;

      difficultyButtons.forEach((item) => {
        item.classList.remove("bg-white", "shadow-sm", "text-secondary");
        item.classList.add("text-on-surface-variant");
      });

      button.classList.add("bg-white", "shadow-sm", "text-secondary");
    });
  });

  generateButton.addEventListener("click", async () => {
    const topic = document.getElementById("topicInput").value.trim();
    const questionType = document.getElementById("questionTypeSelect").value;
    const numQuestions = Number(document.getElementById("questionRange").value);

    if (!topic) {
      message.textContent = "Please enter a topic before generating a quiz.";
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Generating...";
    message.textContent = "";

    try {
      const quiz = await generateQuiz({
        topic,
        question_type: questionType,
        difficulty: selectedDifficulty,
        num_questions: numQuestions
      });

      sessionStorage.setItem("studyBuddyCurrentQuiz", JSON.stringify(quiz));
      sessionStorage.removeItem("studyBuddyAnswers");
      sessionStorage.removeItem("studyBuddyResults");

      window.location.href = "/quiz";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Generate Quiz";
    }
  });
});

async function renderRecentActivities() {
  const container = document.getElementById("recentActivityContainer");
  if (!container) {
    return;
  }

  try {
    const summary = await getAnalyticsSummary();
    const sessions = (summary.sessions || []).slice(0, 3);
    const totalQuizzes = summary.total_quizzes || 0;
    const progressPercentage = Math.min((totalQuizzes / 10) * 100, 100);

    setText("dashboardTotalQuizzes", totalQuizzes);
    setText(
      "dashboardProgressText",
      totalQuizzes
        ? `${Math.max(10 - totalQuizzes, 0)} more completed quizzes to reach the next milestone.`
        : "Complete your first quiz to start tracking progress."
    );

    const dashboardProgressBar = document.getElementById("dashboardProgressBar");
    if (dashboardProgressBar) {
      dashboardProgressBar.style.width = `${progressPercentage}%`;
    }

    container.innerHTML = "";

    if (!sessions.length) {
      container.innerHTML = `
        <div class="p-4 rounded-2xl bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm">
          No completed quizzes yet.
        </div>
      `;
      return;
    }

    sessions.forEach((session) => {
      const item = document.createElement("div");
      item.className = "flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container transition-colors";
      item.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
          <span class="material-symbols-outlined">quiz</span>
        </div>
        <div class="flex-grow">
          <p class="font-label-md text-label-md text-on-surface">${session.topic}</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">
            ${session.difficulty} - ${session.correct_count}/${session.num_questions} correct
          </p>
        </div>
        <div class="text-right">
          <span class="font-label-md text-label-md text-primary">${session.score_percentage}%</span>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error(error);
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}
