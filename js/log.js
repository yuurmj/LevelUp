document.addEventListener('DOMContentLoaded', () => {
    let isEditing = false;
    let editingDate = null;
    
    function getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('levelup_currentUser'));
    }

    function getUserKey(suffix) {
        const user = getCurrentUser();
        if (!user) return null;
        return `levelup_${user.email}_${suffix}`;
    }

    const STORAGE_KEY = getUserKey('logs');
    if (!STORAGE_KEY) {
        alert('로그인이 필요합니다.');
        location.href = 'login.html';
        return;
    }

    const logForm = document.getElementById('logForm');
    const logList = document.getElementById('logList');

    function getToday() {
        const today = new Date();
        return today.toISOString().slice(0,10);
    }

    logForm.addEventListener('submit', e => {
        e.preventDefault();
        const date = getToday();
        const reflection = document.getElementById('logReflection').value.trim();
        const memo = document.getElementById('logMemo').value.trim();
        
        if (!reflection && !memo) {
            alert("회고 또는 메모를 입력하세요!");
            return;
        }

        const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const newLogs = logs.filter(item => item.date !== date);
        newLogs.unshift({ date, reflection, memo });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));

        renderLogList();
        logForm.reset();
    });

    function renderLogList() {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        logList.innerHTML = '';

        logs.forEach(item => {
            const li = document.createElement('li');
            li.className = 'logItem';
            li.dataset.date = item.date;
            
            li.innerHTML = `
                <div class="logItemDate">${item.date}</div>
                <div class="logItemReflection">${item.reflection ? "📝 " : ""}<span class="reflectionText"></span><textarea class="reflectionEdit" style="display:none;"></textarea></div>
                <div class="logItemMemo">${item.memo ? "💡 " : ""}<span class="memoText"></span><textarea class="memoEdit" style="display:none;"></textarea></div>
                <div class="logItemButtons">
                    <button class="editBtn">수정</button>
                    <button class="saveBtn" style="display:none;">저장</button>
                    <button class="cancelBtn" style="display:none;">취소</button>
                    <button class="deleteBtn">삭제</button>
                </div>
            `;

            const reflectionText = li.querySelector('.reflectionText');
            const reflectionEdit = li.querySelector('.reflectionEdit');
            const memoText = li.querySelector('.memoText');
            const memoEdit = li.querySelector('.memoEdit');
            const editBtn = li.querySelector('.editBtn');
            const saveBtn = li.querySelector('.saveBtn');
            const cancelBtn = li.querySelector('.cancelBtn');
            const deleteBtn = li.querySelector('.deleteBtn');

            reflectionText.textContent = item.reflection || '';
            reflectionEdit.value = item.reflection || '';
            memoText.textContent = item.memo || '';
            memoEdit.value = item.memo || '';
            
            deleteBtn.onclick = () => {
                if (confirm('이 기록을 삭제할까요?')) {
                    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                    const newLogs = logs.filter(log => log.date !== item.date);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
                    if (isEditing && editingDate === item.date) {
                        isEditing = false;
                        editingDate = null;
                        logForm.reset();
                        logForm.querySelector('button[type="submit"]').textContent = '저장';
                    }
                    renderLogList();
                }
            };

            editBtn.onclick = () => {
                if (isEditing) {
                    alert('다른 기록 수정 중입니다. 완료하거나 취소하세요.');
                    return;
                }
                isEditing = true;
                editingDate = item.date;

                reflectionText.style.display = 'none';
                memoText.style.display = 'none';
                reflectionEdit.style.display = 'block';
                memoEdit.style.display = 'block';

                editBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';
                cancelBtn.style.display = 'inline-block';
                deleteBtn.style.display = 'none';
            };

            saveBtn.onclick = () => {
                const newReflection = reflectionEdit.value.trim();
                const newMemo = memoEdit.value.trim();

                const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                const updatedLogs = logs.map(log => {
                    if (log.date === item.date) {
                        return { date: log.date, reflection: newReflection, memo: newMemo };
                    }
                    return log;
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

                reflectionText.textContent = newReflection;
                memoText.textContent = newMemo;

                reflectionText.style.display = 'inline';
                memoText.style.display = 'inline';
                reflectionEdit.style.display = 'none';
                memoEdit.style.display = 'none';

                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
                deleteBtn.style.display = 'inline-block';

                isEditing = false;
                editingDate = null;
            };

            cancelBtn.onclick = () => {
                reflectionEdit.value = reflectionText.textContent;
                memoEdit.value = memoText.textContent;

                reflectionText.style.display = 'inline';
                memoText.style.display = 'inline';
                reflectionEdit.style.display = 'none';
                memoEdit.style.display = 'none';

                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
                deleteBtn.style.display = 'inline-block';

                isEditing = false;
                editingDate = null;
            };
            
            logList.appendChild(li);
        });
    }
    
    renderLogList();
});