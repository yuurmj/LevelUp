document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.signupForm');
    const STORAGE_KEY = 'levelup_users';

    const msgs = {
        nickname: document.getElementById('nicknameMsg'),
        email:    document.getElementById('emailMsg'),
        password: document.getElementById('passwordMsg'),
        confirm:  document.getElementById('confirmMsg'),
    };

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]).{8,20}$/;

    const signupBtn = form.querySelector('.signupBtn');

    function showFieldMsg(field, text, isSuccess = false) {
        const el = msgs[field];
        el.textContent = text;
        el.classList.toggle('error', !isSuccess);
        el.classList.toggle('success', isSuccess);
    }

    function clearFieldMsg(field) {
        const el = msgs[field];
        el.textContent = '';
        el.classList.remove('error', 'success');
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    // 닉네임: 2~10자, 중복 체크
    function validateNickname() {
        clearFieldMsg('nickname');
        const nickname = form.nickname.value.trim();
        const users = getUsers();

        if (nickname.length === 0) {
            return false;
        }
        if (nickname.length < 2 || nickname.length > 10) {
            showFieldMsg('nickname', '2~10자로 입력해 주세요.');
            return false;
        }
        if (users.some(u => u.nickname === nickname)) {
            showFieldMsg('nickname', '이미 사용 중인 닉네임입니다.');
            return false;
        }

        showFieldMsg('nickname', '사용 가능한 닉네임입니다.', true);
        return true;
    }

    // 이메일: 형식, 중복 체크
    function validateEmail() {
        clearFieldMsg('email');
        const email = form.email.value.trim();
        const users = getUsers();

        if (email.length === 0) {
            return false;
        }
        if (!emailRegex.test(email)) {
            showFieldMsg('email', '유효한 이메일이 아닙니다.');
            return false;
        }
        if (users.some(u => u.email === email)) {
            showFieldMsg('email', '이미 사용 중인 이메일입니다.');
            return false;
        }

        showFieldMsg('email', '사용 가능한 이메일입니다.', true);
        return true;
    }

    // 비밀번호: 형식 체크
    function validatePassword() {
        clearFieldMsg('password');
        const pw = form.password.value;
        if (pw.length === 0) {
            return false;
        }
        if (!passwordRegex.test(pw)) {
            showFieldMsg('password', '영문·숫자·특수문자 조합 8~20자여야 합니다.');
            return false;
        }
        showFieldMsg('password', '사용 가능한 비밀번호입니다.', true);
        return true;
    }

    // 비밀번호 확인: 일치 여부 체크
    function validateConfirm() {
        clearFieldMsg('confirm');
        const pw = form.password.value;
        const confirm = form.confirm.value;

        if (confirm.length === 0) {
            return false;
        }
        if (confirm && confirm !== pw) {
            showFieldMsg('confirm', '비밀번호가 일치하지 않습니다.');
            return false;
        }
        if (confirm && confirm === pw) {
            showFieldMsg('confirm', '비밀번호가 일치합니다.', true);
            return true;
        }
        return false;
    }

   function isFormValid() {
        return (
            validateNickname() &&
            validateEmail() &&
            validatePassword() &&
            validateConfirm()
        );
    }

    form.nickname.addEventListener('input', () => {
        validateNickname();
        signupBtn.disabled = !isFormValid();
    });
    form.email.addEventListener('input', () => {
        validateEmail();
        signupBtn.disabled = !isFormValid();
    });
    form.password.addEventListener('input', () => {
        validatePassword();
        validateConfirm();
        signupBtn.disabled = !isFormValid();
    });
    form.confirm.addEventListener('input', () => {
        validateConfirm();
        signupBtn.disabled = !isFormValid();
    });

    signupBtn.disabled = true;

    form.addEventListener('submit', e => {
        e.preventDefault();

        if (!isFormValid()) {
            signupBtn.disabled = true;
            return;
        }

        const nickname = form.nickname.value.trim();
        const email    = form.email.value.trim();
        const pw       = form.password.value;
        const users = getUsers();

        users.push({ nickname, email, password: pw });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

        alert('회원가입 완료! 로그인 페이지로 이동합니다.');
        location.href = 'login.html';
    });
});