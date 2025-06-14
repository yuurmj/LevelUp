document.addEventListener("DOMContentLoaded", () => {
    function getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('levelup_currentUser'));
    }
    
    function getUserKey(suffix) {
        const user = getCurrentUser();
        if (!user) return null;
        return `levelup_${user.email}_${suffix}`;
    }

    const STORAGE_KEY_ACT = getUserKey('activities');
    const STORAGE_KEY_LOG = getUserKey('logs');
    if (!STORAGE_KEY_ACT || !STORAGE_KEY_LOG) {
        alert('로그인이 필요합니다.');
        location.href = 'login.html';
        return;
    }

    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthLabel = document.getElementById("currentMonth");
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");
    const dayActivityList = document.getElementById("dayActivityList");
    const selectDateTitle = document.getElementById("selectDateTitle");

    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    function getActivities() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_ACT)) || [];
    }
    function getLogs() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_LOG)) || [];
    }
    function getLogByDate(date) {
        return getLogs().find(item => item.date === date);
    }

    // 달력 렌더링
    function renderCalendar(year, month) {
        const activities = getActivities();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekday = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        calendarGrid.innerHTML = "";

        // 요일 헤더
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        weekdays.forEach(day => {
            const header = document.createElement("div");
            header.className = "dayHeader";
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // 빈 칸
        for (let i = 0; i < startWeekday; i++) {
            const empty = document.createElement("div");
            empty.className = "emptyCell";
            calendarGrid.appendChild(empty);
        }

        // 날짜 채우기
        for (let date = 1; date <= daysInMonth; date++) {
            const cell = document.createElement("div");
            cell.className = "dayCell";
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

            const inner = document.createElement("div");
            inner.className = "dateNum";
            inner.textContent = date;
            cell.appendChild(inner);

            // 활동 있으면 점 표시
            const hasActivity = activities.some(act => act.date === dateStr && act.done);
            if (hasActivity) cell.classList.add("hasActivity");

            // 클릭 시 활동 목록 표시
            cell.addEventListener("click", () => {
                renderActivitiesAndLogForDate(dateStr);
            });

            calendarGrid.appendChild(cell);
        }

        currentMonthLabel.textContent = `${year}년 ${month + 1}월`;
    }

    // 선택한 날짜의 섹션별 렌더링
    function renderActivitiesAndLogForDate(dateStr) {
        const [year, month, day] = dateStr.split("-");
        const formattedDate = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        
        // 1. 활동 섹션
        selectDateTitle.innerHTML = `${formattedDate}의 활동`;
        dayActivityList.innerHTML = "";

        const activities = getActivities().filter(
            act => act.date === dateStr && act.done === true
        );

        if (activities.length === 0) {
            const li = document.createElement("li");
            li.className = "empty";
            li.textContent = "완료된 활동이 없습니다.";
            dayActivityList.appendChild(li);
        } else {
            activities.forEach(act => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="dayActivityTop">
                        <div class="dayActivityContent">
                            <span><strong>[${act.category}]</strong> ${act.content}</span>
                        </div>
                    </div>
                    ${act.note ? `<p class="dayActivityNote">💬 ${act.note}</p>` : ""}
                `;
                dayActivityList.appendChild(li);
            });
        }

        // 2. 회고/메모 섹션
        document.getElementById("logSectionTitle").innerHTML = `${formattedDate}의 회고 및 메모`;
        const logCardList = document.getElementById("logCardList");
        logCardList.innerHTML = "";

        const log = getLogByDate(dateStr);

        if (log && (log.reflection?.length > 0 || log.memo?.length > 0)) {
            const li = document.createElement("li");
            li.className = "logItem";
            li.innerHTML = `
                ${log.reflection ? `<div class="logItemReflection">📝 ${log.reflection}</div>` : ""}
                ${log.memo ? `<div class="logItemMemo">💡 ${log.memo}</div>` : ""}
            `;
            logCardList.appendChild(li);
        } else {
            const li = document.createElement("li");
            li.className = "empty";
            li.textContent = `작성된 회고 및 메모가 없습니다.`;
            logCardList.appendChild(li);
        }
    }

    // 월 이동
    prevBtn.addEventListener("click", () => {
        if (currentMonth === 0) {
            currentYear--;
            currentMonth = 11;
        } else {
            currentMonth--;
        }
        renderCalendar(currentYear, currentMonth);
    });
    nextBtn.addEventListener("click", () => {
        if (currentMonth === 11) {
            currentYear++;
            currentMonth = 0;
        } else {
            currentMonth++;
        }
        renderCalendar(currentYear, currentMonth);
    });

    renderCalendar(currentYear, currentMonth);
});