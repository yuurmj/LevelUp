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
    const STORAGE_KEY_CAT = getUserKey('categories');
    
    if (!STORAGE_KEY_ACT || !STORAGE_KEY_CAT) {
        alert('로그인이 필요합니다.');
        location.href = 'login.html';
        return;
    }
    
    const form = document.getElementById("activityForm");
    const category = document.getElementById("categorySelect");
    const content = document.getElementById("activityInput");
    const note = document.getElementById("activityNote");
    const listToday = document.getElementById("activityListToday");

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_ACT)) || [];    
    const todayStr = new Date().toISOString().split("T")[0];

    const openModalBtn = document.getElementById("openCategoryModal");
    const modal = document.getElementById("categoryModal");
    const closeModalBtn = document.getElementById("closeCategoryModal");
    const categoryList = document.getElementById("categoryList");
    const addCategoryForm = document.getElementById("addCategoryForm");
    const newCategoryName = document.getElementById("newCategoryName");

    const categoryFilterButtons = document.getElementById('categoryFilterBtns');
    const categoryActivitiesModal = document.getElementById('categoryActivitiesModal');
    const modalCategoryTitle = document.getElementById('modalCategoryTitle');
    const categoryActivitiesContainer = document.getElementById('categoryActivitiesContainer');
    const closeCategoryActivitiesModalBtn = document.getElementById('closeCategoryActivitiesModal');

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toastMessage';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fadeOut');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 2000);
    }

    function getCategories() {
        let cats = JSON.parse(localStorage.getItem(STORAGE_KEY_CAT));
        if (Array.isArray(cats) && typeof cats[0] === 'object') {
            cats = cats.map(c => c.label || c.id || String(c));
            localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(cats));
        }
        if (!cats || cats.length === 0) {
            cats = ["습관", "공부", "운동", "독서"];
            localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(cats));
        }
        return cats;
    }

    function setCategories(arr) {
        localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(arr));
    }

    function renderCategorySelect() {
        const cats = getCategories();
        category.innerHTML = cats.map(
            cat => `<option value="${cat}">${cat}</option>`
        ).join('');
    }

    function renderCategoryListInModal() {
        const cats = getCategories();
        categoryList.innerHTML = '';
        cats.forEach((cat, idx) => {
            const li = document.createElement('li');
            li.className = "categoryListItem";

            if (window._editingCatIdx === idx) {
                li.innerHTML = `
                    <input type="text" class="editCatInput" value="${cat}">
                    <div class="categoryBtns">
                        <button class="saveCatBtn deleteBtn">저장</button>
                        <button class="cancelCatBtn deleteBtn">취소</button>
                    </div>
                `;
                // 저장
                li.querySelector('.saveCatBtn').onclick = () => {
                    const newLabel = li.querySelector('.editCatInput').value.trim();
                    if (!newLabel) return alert('카테고리명을 입력하세요.');
                    if (cats.includes(newLabel) && newLabel !== cat) {
                        return alert('이미 존재하는 카테고리명입니다.');
                    }
                    cats[idx] = newLabel;
                    setCategories(cats);
                    window._editingCatIdx = null;
                    setCategories(cats);
                    renderCategoryListInModal();
                    renderCategorySelect();
                };
                // 취소
                li.querySelector('.cancelCatBtn').onclick = () => {
                    window._editingCatIdx = null;
                    renderCategoryListInModal();
                };
            } else {
                li.innerHTML = `
                    <span>${cat}</span>
                    <div class="categoryEditBtns">
                        <button class="editCatBtn deleteBtn">수정</button>
                        <button class="deleteCatBtn deleteBtn" ${cats.length <= 1 ? "disabled" : ""} title="삭제">삭제</button>
                    </div>
                `;
                // 수정 클릭
                li.querySelector('.editCatBtn').onclick = () => {
                    window._editingCatIdx = idx;
                    setCategories(cats);
                    renderCategoryListInModal();
                };
                // 삭제
                li.querySelector('.deleteCatBtn').onclick = () => {
                    if (confirm('이 카테고리를 삭제할까요?')) {
                        cats.splice(idx, 1);
                        setCategories(cats);
                        renderCategoryListInModal();
                        renderCategorySelect();
                    }
                };
            }
            categoryList.appendChild(li);
        });
    }

    openModalBtn.addEventListener("click", () => {
        renderCategoryListInModal();
        modal.style.display = "flex"; 
        newCategoryName.value = "";
        newCategoryName.focus();
    });
    closeModalBtn.addEventListener("click", () => modal.style.display = "none");

    addCategoryForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = newCategoryName.value.trim();
        if (!name) return;
        const cats = getCategories();

        if (cats.some(c => c.label === name)) {
            alert("이미 존재하는 카테고리입니다.");
            return;
        }

        cats.push(name);
        setCategories(cats);
        renderCategoryListInModal();
        renderCategorySelect();
        newCategoryName.value = "";

        renderCategoryFilterButtons();
    });

    saved.forEach(activity => {
        if (activity.date === todayStr)
            renderActivity(activity, listToday);
    })

    // 새 활동 추가
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const categoryValue = category.value;
        const contentValue = content.value.trim();
        const noteValue = note.value.trim();

        if (!contentValue) return;

        const newActivity = {
            id: Date.now(),
            category: categoryValue,
            content: contentValue,
            note: noteValue,
            done: false,
            date: todayStr
        };

        saved.push(newActivity);
        localStorage.setItem(STORAGE_KEY_ACT, JSON.stringify(saved));
        renderActivity(newActivity, listToday);

        content.value = "";
        note.value = "";
        category.value = getCategories()[0]; 
    });

    // 화면에 렌더링
    function renderActivity(activity, targetList, categories) {
        const li = document.createElement("li");
        li.className = "activityItem";
        li.dataset.id = activity.id;

        const checked = activity.done ? "checked" : "";
        li.innerHTML = `
            <div class="activityTop">
                <div class="activityContent">
                    <input type="checkbox" class="activityCheck" ${checked} />
                    <span class="activityText"><strong>[${activity.category}]</strong> ${activity.content}</span>
                    <input type="text" class="activityEditInput" value="${activity.content}" style="display:none; width: 80%;" />
                </div>
                <button class="editBtn">수정</button>
                <button class="saveBtn" style="display:none;">저장</button>
                <button class="cancelBtn" style="display:none;">취소</button>
                <button class="deleteBtn">삭제</button>
            </div>
            <p class="activityNote">
                <span class="noteIcon">💬</span>
                <span class="noteText">${activity.note || ""}</span>
                <textarea class="noteEditInput" style="display:none; width: 100%; height: 60px;">${activity.note || ""}</textarea>
            </p>
        `; 

        // 체크박스 이벤트
        li.querySelector(".activityCheck").addEventListener("change", (e) => {
            activity.done = e.target.checked;
            localStorage.setItem(STORAGE_KEY_ACT, JSON.stringify(saved));
            if (activity.done) showToast('축하합니다! 활동을 완료했어요 🎉');
        });

        attachEditDeleteEvents(li, activity);

        targetList.appendChild(li);
    }

    function attachEditDeleteEvents(cardElement, activity) {
        const editBtn = cardElement.querySelector(".editBtn");
        const saveBtn = cardElement.querySelector(".saveBtn");
        const cancelBtn = cardElement.querySelector(".cancelBtn");
        const deleteBtn = cardElement.querySelector(".deleteBtn");
        
        const textSpan = cardElement.querySelector(".activityText");
        const editInput = cardElement.querySelector(".activityEditInput");
        const noteTextSpan = cardElement.querySelector(".noteText");
        const noteEditInput = cardElement.querySelector(".noteEditInput");

        editBtn.addEventListener("click", () => {
            textSpan.style.display = "none";
            editInput.style.display = "inline-block";
            noteTextSpan.style.display = "none";
            noteEditInput.style.display = "block";

            editBtn.style.display = "none";
            saveBtn.style.display = "inline-block";
            cancelBtn.style.display = "inline-block";
            deleteBtn.style.display = "none";

            editInput.focus();
            noteEditInput.focus();
        });

        saveBtn.addEventListener("click", () => {
            const newContent = editInput.value.trim();
            const newNote = noteEditInput.value.trim();

            if (newContent) {
                activity.content = newContent;
                textSpan.innerHTML = `<strong>[${activity.category}]</strong> ${newContent}`;
            }
            activity.note = newNote;
            noteTextSpan.textContent = newNote;

            localStorage.setItem(STORAGE_KEY_ACT, JSON.stringify(saved));

            textSpan.style.display = "inline";
            editInput.style.display = "none";
            noteTextSpan.style.display = "inline";
            noteEditInput.style.display = "none";

            editBtn.style.display = "inline-block";
            saveBtn.style.display = "none";
            cancelBtn.style.display = "none";
            deleteBtn.style.display = "inline-block";
        });

        cancelBtn.addEventListener("click", () => {
            editInput.value = activity.content;
            noteEditInput.value = activity.note;

            textSpan.style.display = "inline";
            editInput.style.display = "none";
            noteTextSpan.style.display = "inline";
            noteEditInput.style.display = "none";

            editBtn.style.display = "inline-block";
            saveBtn.style.display = "none";
            cancelBtn.style.display = "none";
            deleteBtn.style.display = "inline-block";
        });

        deleteBtn.addEventListener("click", () => {
            if (confirm("이 활동을 삭제할까요?")) {
                const idx = saved.findIndex(a => a.id === activity.id);
                if (idx !== -1) {
                    saved.splice(idx, 1);
                    localStorage.setItem(STORAGE_KEY_ACT, JSON.stringify(saved));
                    cardElement.remove();
                }
            }
        });
    }

    function renderCategoryFilterButtons() {
        const cats = getCategories();
        categoryFilterButtons.innerHTML = '';
        cats.forEach(cat => {
            const btn = document.createElement('button');
            btn.textContent = cat;
            btn.addEventListener('click', () => openCategoryModal(cat));
            categoryFilterButtons.appendChild(btn);
        });
    }

    function openCategoryModal(category) {
        modalCategoryTitle.textContent = `${category}`;
        
        const filteredActivities = saved.filter(act => act.category === category);
        if (filteredActivities.length === 0) {
            categoryActivitiesContainer.innerHTML = `
                <div class="modalActivityCard noActivityCard">
                    해당 카테고리에 기록된 활동이 없습니다.
                </div>
            `;
            categoryActivitiesModal.style.display = 'flex';
            return;
        }

        categoryActivitiesContainer.innerHTML = '';

        const grouped = filteredActivities.reduce((acc, act) => {
            if (!acc[act.date]) acc[act.date] = [];
            acc[act.date].push(act);
            return acc;
        }, {});
        
        Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            const cardsWrapper = document.createElement('div');
            cardsWrapper.className = 'categoryActivitiesContainer';
            
            grouped[date].forEach(activity => {
                const card = document.createElement('div');
                card.className = 'modalActivityCard';

                card.innerHTML = `
                    <div class="modalActivityTop">
                        <div class="modalActivityDate">${date}</div>
                        <div class="modalActivityButtons">
                            <button class="editBtn">수정</button>
                            <button class="saveBtn" style="display:none;">저장</button>
                            <button class="cancelBtn" style="display:none;">취소</button>
                            <button class="deleteBtn">삭제</button>
                        </div>
                    </div>
                    <div class="modalActivityMiddle">
                        <div class="activityContent">
                            <input type="checkbox" class="activityCheck" ${activity.done ? 'checked' : ''} />
                            <span class="activityText"><strong>[${activity.category}]</strong> ${activity.content}</span>
                            <input type="text" class="activityEditInput" value="${activity.content}" style="display:none; width: 80%;" />
                        </div>
                    </div>
                    <p class="activityNote">
                        <span class="noteIcon">💬</span>
                        <span class="noteText">${activity.note || ""}</span>
                        <textarea class="noteEditInput" style="display:none; width: 100%; height: 60px;">${activity.note || ""}</textarea>
                    </p>
                `;

                attachEditDeleteEvents(card, activity);
                cardsWrapper.appendChild(card);
            });
            
            categoryActivitiesContainer.appendChild(cardsWrapper);
        });

        categoryActivitiesModal.style.display = 'flex';
    }

    closeCategoryActivitiesModalBtn.addEventListener('click', () => {
        categoryActivitiesModal.style.display = 'none';
    });

    renderCategorySelect();
    renderCategoryFilterButtons();
});