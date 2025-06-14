document.addEventListener("DOMContentLoaded", () => {
    function getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('levelup_currentUser'));
    }

    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다.');
        location.href = 'login.html';
        return;
    }

    const storedNickname = localStorage.getItem(`levelup_${user.email}_nickname`);
    if (storedNickname) {
        user.nickname = storedNickname;
    }
    let currentNickname = user.nickname || '닉네임 없음';

    const email = user.email;
    const STORAGE_KEY_ACT = `levelup_${email}_activities`;
    const STORAGE_KEY_BADGES = `levelup_${email}_badges`;
    const allActs = JSON.parse(localStorage.getItem(STORAGE_KEY_ACT)) || [];
    const acts = allActs;
    let badgesOwned = JSON.parse(localStorage.getItem(STORAGE_KEY_BADGES)) || {};

    const nicknameDiv = document.getElementById('profileNickname');
    let nicknameInput = document.getElementById('profileNicknameInput');
    const editBtn = document.getElementById('editProfileBtn');
    let saveBtn = document.getElementById('saveProfileBtn');
    let cancelBtn = document.getElementById('cancelProfileBtn');

    if (!nicknameInput) {
        nicknameInput = document.createElement('input');
        nicknameInput.type = 'text';
        nicknameInput.id = 'profileNicknameInput';
        nicknameInput.style.display = 'none';
        nicknameDiv.parentNode.insertBefore(nicknameInput, nicknameDiv.nextSibling);
    }
    if (!saveBtn) {
        saveBtn = document.createElement('button');
        saveBtn.id = 'saveProfileBtn';
        saveBtn.textContent = '저장';
        saveBtn.style.display = 'none';
        nicknameDiv.parentNode.insertBefore(saveBtn, nicknameInput.nextSibling);
    }
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelProfileBtn';
        cancelBtn.textContent = '취소';
        cancelBtn.style.display = 'none';
        nicknameDiv.parentNode.insertBefore(cancelBtn, saveBtn.nextSibling);
    }

    const badgeDefs = {
        firstActivity: {
            name: '첫 활동',
            icon: '🥇',
            desc: '처음으로 활동을 기록했어요!',
            check: acts => acts.length >= 1,
        },
        weekStreak: {
            name: '7일 연속',
            icon: '🔥',
            desc: '7일 연속 활동을 성공했어요!',
            check: acts => {
                const dates = [...new Set(acts.map(a => a.date))].sort();
                if (dates.length < 7) return false;
                for (let i = 1; i < 7; i++) {
                const d0 = new Date(dates[dates.length - 1]);
                d0.setDate(d0.getDate() - i);
                const d1 = new Date(dates[dates.length - 1 - i]);
                if (d0.toISOString().split('T')[0] !== d1.toISOString().split('T')[0]) return false;
                }
                return true;
            }
        },
        monthStreak: {
            name: '30일 연속',
            icon: '🏆',
            desc: '30일 연속 활동 대단해요!',
            check: acts => {
                const dates = [...new Set(acts.map(a => a.date))].sort();
                if (dates.length < 30) return false;
                for (let i = 1; i < 30; i++) {
                const d0 = new Date(dates[dates.length - 1]);
                d0.setDate(d0.getDate() - i);
                const d1 = new Date(dates[dates.length - 1 - i]);
                if (d0.toISOString().split('T')[0] !== d1.toISOString().split('T')[0]) return false;
                }
                return true;
            }
        },
        day100Streak: {
            name: '100일 연속',
            icon: '🌟',
            desc: '100일 연속 활동, 놀라워요!',
            check: acts => {
                const dates = [...new Set(acts.map(a => a.date))].sort();
                if (dates.length < 100) return false;
                for (let i = 1; i < 100; i++) {
                const d0 = new Date(dates[dates.length - 1]);
                d0.setDate(d0.getDate() - i);
                const d1 = new Date(dates[dates.length - 1 - i]);
                if (d0.toISOString().split('T')[0] !== d1.toISOString().split('T')[0]) return false;
                }
                return true;
            }
        },
        total10: {
            name: '10회 활동',
            icon: '✨',
            desc: '총 10회 활동을 달성했어요.',
            check: acts => acts.length >= 10,
        },
        total100: {
            name: '100회 활동',
            icon: '💎',
            desc: '총 100회 활동을 달성했어요.',
            check: acts => acts.length >= 100,
        },
        max5PerDay: {
            name: '하루 5개 이상',
            icon: '🎯',
            desc: '하루에 5개 이상 활동 완료!',
            check: acts => {
                const counts = {};
                acts.forEach(a => {
                counts[a.date] = (counts[a.date] || 0) + 1;
                });
                return Object.values(counts).some(c => c >= 5);
            }
        },
        max10PerDay: {
            name: '하루 10개 이상',
            icon: '🚀',
            desc: '하루에 10개 이상 활동 완료!',
            check: acts => {
                const counts = {};
                acts.forEach(a => {
                counts[a.date] = (counts[a.date] || 0) + 1;
                });
                return Object.values(counts).some(c => c >= 10);
            }
        },
    };

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toastMessage';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
        toast.classList.add('fadeOut');
        toast.addEventListener('transitionend', () => toast.remove());
        }, 2500);
    }

    function getProfileData(nickname) {
        let xp = 0;
        let total = acts.length;
        let streak = 0;
        let badgesList = Object.values(badgesOwned).map(b => b.name);

        const today = new Date().toISOString().split("T")[0];
        let currStreak = 0, maxStreak = 0;

        acts.sort((a, b) => a.date.localeCompare(b.date));
        let dates = [...new Set(acts.map(a => a.date))];
        for (let i = 0; i < dates.length; i++) {
            if (i === 0 || (
                new Date(dates[i]) - new Date(dates[i - 1]) === 24 * 60 * 60 * 1000
            )) currStreak++;
            else currStreak = 1;
            if (dates[i] === today) streak = currStreak;
            if (currStreak > maxStreak) maxStreak = currStreak;
        }
        if (!streak) streak = maxStreak;

        acts.forEach(a => {
            xp += 10;
            if (a.done) xp += 5;
        });

        let oldLevel = parseInt(localStorage.getItem("profile_oldLevel") || 1, 10);
        let level = Math.min(99, Math.floor(xp / 100) + 1);
        let xpToLevel = 100;
        let xpCurr = xp % 100;
        let xpRemain = xpToLevel - xpCurr;
        let didLevelUp = (level > oldLevel);
        localStorage.setItem("profile_oldLevel", level);

        return {
            nickname, level, xpCurr, xpToLevel, xpRemain, total, streak, badges: badgesList, acts, didLevelUp
        }
    }

    // 레벨업 애니메이션 실행 함수
    function showLevelUpAnim() {
        const anim = document.getElementById('profileLevelUpAnim');
        anim.style.display = "block";
        anim.classList.add("active");
        setTimeout(() => {
            anim.classList.remove("active");
            anim.style.display = "none";
        }, 1300); // 1.3초간 표시
    }

    // 최근 7일 히스토리(●/○)
    function getRecentHistory(acts) {
        let map = {}; acts.forEach(a => { map[a.date] = true; });
        let dots = [];
        for (let i = 6; i >= 0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            let ds = d.toISOString().split('T')[0];
            dots.push(map[ds] ? "●" : "○");
        }
        return dots;
    }

    // 데이터 렌더링
    function renderProfile() {
        const data = getProfileData(currentNickname);
        nicknameDiv.textContent = data.nickname;
        nicknameInput.value = data.nickname;
        document.getElementById("profileLevel").textContent = data.level;
        document.getElementById("profileXP").textContent = `${data.xpCurr} XP`;
        document.getElementById("profileXPBar").style.width =
            (data.xpCurr / data.xpToLevel) * 100 + "%";
        document.getElementById("profileTotalActs").textContent = data.total;
        document.getElementById("profileStreak").textContent = data.streak + "일";

        const badgeValueDiv = document.getElementById("profileBadgesValue");
        if (data.badges.length) {
            badgeValueDiv.innerHTML = data.badges.join(", ").replace(/, /g, "<br>");
        } else {
            badgeValueDiv.textContent = "-";
        }

        document.getElementById("profileXPRemain").textContent =
            "다음 레벨까지 " + data.xpRemain + " XP 남았어요!";
        document.getElementById("profileHistoryDots").textContent = getRecentHistory(
            data.acts
        ).join(" ");
        if (data.didLevelUp) showLevelUpAnim();
    }

    renderProfile();


    editBtn.addEventListener('click', () => {
        nicknameDiv.style.display = 'none';
        nicknameInput.style.display = 'inline-block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        nicknameInput.focus();
    });

    saveBtn.addEventListener('click', () => {
        const newName = nicknameInput.value.trim();
        if (newName) {
            currentNickname = newName;
            user.nickname = newName;
            sessionStorage.setItem('levelup_currentUser', JSON.stringify(user));
            localStorage.setItem(`levelup_${email}_nickname`, newName);
        }
        nicknameDiv.textContent = currentNickname;
        nicknameDiv.style.display = 'inline-block';
        nicknameInput.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        nicknameInput.value = currentNickname;
        nicknameDiv.style.display = 'inline-block';
        nicknameInput.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    });

    function updateAndRenderBadges() {
        updateBadges();
        renderBadgeCollection();
    }

    function updateBadges() {
        let newBadges = {};
        Object.entries(badgeDefs).forEach(([key, badge]) => {
            if (badge.check(acts)) {
                newBadges[key] = {
                    name: badge.name,
                    icon: badge.icon,
                    desc: badge.desc,
                    date: badgesOwned[key]?.date || new Date().toISOString().split('T')[0]
                };
            }
        });

        Object.keys(newBadges).forEach(key => {
            if (!badgesOwned[key]) {
                showToast(`뱃지 획득! ${newBadges[key].icon} ${newBadges[key].name}`);
            }
        });

        badgesOwned = newBadges;
        localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badgesOwned));
    }

    const badgeModal = document.getElementById('badgeModal');
    const badgeModalList = document.getElementById('badgeModalList');
    const closeBadgeModalBtn = document.getElementById('closeBadgeModal');
    const badgeCollectionContainer = document.getElementById('profileBadges');

    badgeCollectionContainer.style.cursor = 'pointer';
    badgeCollectionContainer.addEventListener('click', () => {
        badgeModal.style.display = 'flex';
        renderBadgeModalList();
    });

    closeBadgeModalBtn.addEventListener('click', () => {
        badgeModal.style.display = 'none';
    });

    function renderBadgeCollection() {
        const container = badgeCollectionContainer;
        container.innerHTML = '';
        Object.entries(badgesOwned).forEach(([key, badge]) => {
            const badgeDiv = document.createElement('div');
            badgeDiv.className = 'badgeItem owned';
            badgeDiv.innerHTML = `
                <div class="badgeIcon">${badge.icon}</div>
                <div class="badgeInfo">
                    <div class="badgeName">${badge.name}</div>
                    <div class="badgeDesc">${badge.desc}</div>
                    <div class="badgeStatus">획득: ${badge.date}</div>
                </div>
            `;
            container.appendChild(badgeDiv);
        });

        if (!Object.keys(badgesOwned).length) {
            container.innerHTML = '-';
        }
    }

    function renderBadgeModalList() {
        badgeModalList.innerHTML = '';
        if (!Object.keys(badgesOwned).length) {
            badgeModalList.innerHTML = '<p>아직 획득한 뱃지가 없습니다.</p>';
            return;
        }
        Object.entries(badgesOwned).forEach(([key, badge]) => {
            const badgeDiv = document.createElement('div');
            badgeDiv.className = 'badgeItem owned';
            badgeDiv.innerHTML = `
                <div class="badgeIcon">${badge.icon}</div>
                <div class="badgeInfo">
                    <div class="badgeName">${badge.name}</div>
                    <div class="badgeDesc">${badge.desc}</div>
                    <div class="badgeStatus">획득: ${badge.date}</div>
                </div>
            `;
            badgeModalList.appendChild(badgeDiv);
        });
    }

    updateBadges();
    renderProfile();
});