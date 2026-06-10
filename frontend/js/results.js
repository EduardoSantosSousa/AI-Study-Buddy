document.addEventListener("DOMContentLoaded", () => {
  const storedResults = sessionStorage.getItem("studyBuddyResults");

  if (!storedResults) {
    window.location.href = "/dashboard";
    return;
  }

  const results = JSON.parse(storedResults);

  document.getElementById("scorePercentage").textContent = `${results.score_percentage}%`;
  const scoreCircle = document.querySelector(".circular-progress");
  if (scoreCircle) {
    scoreCircle.style.background =
      `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#6b38d4 ${results.score_percentage}%, #e9ddff 0)`;
  }
  document.getElementById("correctCount").textContent = results.correct_count;
  document.getElementById("incorrectCount").textContent = results.incorrect_count;
  document.getElementById("totalQuestions").textContent = results.total_questions;

  const exportLink = document.getElementById("exportCsvLink");
  exportLink.href = getSessionExportUrl(results.session_id);
  exportLink.download = `quiz_results_${results.session_id}.csv`;

  document.getElementById("tryAgainButton").addEventListener("click", () => {
    sessionStorage.removeItem("studyBuddyAnswers");
    sessionStorage.removeItem("studyBuddyResults");
    window.location.href = "/quiz";
  });

  document.getElementById("dashboardButton").addEventListener("click", () => {
    sessionStorage.removeItem("studyBuddyCurrentQuiz");
    sessionStorage.removeItem("studyBuddyAnswers");
    sessionStorage.removeItem("studyBuddyResults");
    window.location.href = "/dashboard";
  });

  renderDetailedReview(results.results);
});

function renderDetailedReview(items) {
  const container = document.getElementById("detailedReview");
  container.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = item.is_correct
      ? "bg-surface-container-lowest border-l-4 border-[#4ADE80] rounded-xl p-gutter shadow-[0_4px_20px_0_rgba(84,79,192,0.15)]"
      : "bg-surface-container-lowest border-l-4 border-error rounded-xl p-gutter shadow-[0_4px_20px_0_rgba(84,79,192,0.15)]";

    card.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <span class="font-label-md text-label-md text-on-surface-variant">
          Question ${item.question_number}
        </span>
        <span>${item.is_correct ? "Correct" : "Incorrect"}</span>
      </div>
      <p class="font-body-md text-body-md text-on-surface mb-4">${item.question}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-3 rounded-lg border border-outline-variant">
          <span class="font-label-sm text-label-sm block mb-1">Your Answer:</span>
          <p>${item.user_answer}</p>
        </div>
        <div class="p-3 rounded-lg border border-outline-variant">
          <span class="font-label-sm text-label-sm block mb-1">Correct Answer:</span>
          <p>${item.correct_answer}</p>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}
