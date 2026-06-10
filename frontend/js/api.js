const API_BASE_URL = "";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

    if (!response.ok) {
    let message = "Request failed";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch (error) {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
}


async function generateQuiz(payload) {
    return apiRequest("/api/quizzes/generate", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

async function submitQuiz(payload) {
    return apiRequest("/api/quizzes/submit", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

async function getAnalyticsSummary(){
    return apiRequest("/api/analytics/summary");
}

function getSessionExportUrl(sessionId){
    return `${API_BASE_URL}/api/exports/session/${sessionId}.csv`
}

function getAllExportUrl(){
    return `${API_BASE_URL}/api/exports/all.csv`
}
