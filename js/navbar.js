(function() {
    const mobileMenuBtn = document.querySelector('.mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    function updateAuthBtns() {
        const authDiv = document.getElementById('authBtns');
        authDiv.innerHTML = '';
        
        const user = JSON.parse(sessionStorage.getItem('levelup_currentUser'));

        if (user) {
            const myBtn = document.createElement('a');
            myBtn.href = 'profile.html';
            myBtn.textContent = `마이페이지`;
            myBtn.className = 'authBtn';

            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.textContent = '로그아웃';
            logoutBtn.className = 'authBtn';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                sessionStorage.removeItem('levelup_currentUser');
                alert('로그아웃 되었습니다.');
                location.href = '정유림202413485.html';
            };

            authDiv.appendChild(myBtn);
            authDiv.appendChild(logoutBtn);
        } else {
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.textContent = '로그인';
            loginBtn.className = 'authBtn';

            const signupBtn = document.createElement('a');
            signupBtn.href = 'signup.html';
            signupBtn.textContent = '회원가입';
            signupBtn.className = 'authBtn';

            authDiv.appendChild(loginBtn);
            authDiv.appendChild(signupBtn);
        }
    }

    updateAuthBtns();
}) ();