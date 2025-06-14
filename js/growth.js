document.addEventListener("DOMContentLoaded", () => {
  function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('levelup_currentUser'));
  }

  function getUserKey(suffix) {
      const user = getCurrentUser();
      if (!user) return null;
      return `levelup_${user.email}_${suffix}`;
  }
  
  const STORAGE_KEY = getUserKey("activities");
  if (!STORAGE_KEY) {
      alert('로그인이 필요합니다.');
      location.href = 'login.html';
      return;
  }

  const activities = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const totalCompletedEl = document.getElementById("totalCompleted");
  const totalActivitiesEl = document.getElementById("totalActivities");
  const mostCategoryEl = document.getElementById("mostCategory");

  // 통계 계산
  const completedActivities = activities.filter(act => act.done);
  const categoryCount = {};
  activities.forEach(act => {
    const label = act.category;
    categoryCount[label] = (categoryCount[label] || 0) + 1;
  });

  const mostUsedCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "없음";

  totalCompletedEl.textContent = `${completedActivities.length}개`;
  totalActivitiesEl.textContent = `${activities.length}개`;
  mostCategoryEl.textContent = `${mostUsedCategory}`;

  // 차트 데이터 준비
  renderWeeklyChart(activities);
  renderCategoryChart(categoryCount);
});

function renderWeeklyChart(activities) {
  const ctx = document.getElementById("weeklyChart").getContext("2d");

  const today = new Date();
  const dates = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const countMap = Object.fromEntries(dates.map(d => [d, 0]));
  activities.forEach(act => {
    if (act.date in countMap) countMap[act.date]++;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates.map(d => d.slice(5).replace("-", "/")),
      datasets: [{
        label: "활동 수",
        data: Object.values(countMap),
        backgroundColor: "#f28c8c"
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderCategoryChart(categoryCount) {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const labels = Object.keys(categoryCount);
  const data = Object.values(categoryCount);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "카테고리별 활동",
        data,
        backgroundColor: [
          "#f28c8c", "#ffadad", "#ffd6b4", "#fff3cd", "#f9e0d9"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}