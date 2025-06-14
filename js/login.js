document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.loginForm');
  const STORAGE_KEY = 'levelup_users';

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const pw    = form.password.value;

    const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === pw);

    if (!user) {
      return alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const storedNickname = localStorage.getItem(`levelup_${user.email}_nickname`);
    if (storedNickname) {
      user.nickname = storedNickname;
    }

    sessionStorage.setItem('levelup_currentUser', JSON.stringify(user));
    alert(`환영합니다, ${user.nickname}님!`);
    location.href = '정유림202413485.html';
  });
});