document.addEventListener('DOMContentLoaded', function() {
    const userName = sessionStorage.getItem('userName');
    const signInLink = document.getElementById('sign-in-link');
    const userInfo = document.getElementById('user-info');
    const userNameSpan = document.getElementById('user-name');
    const logoutLink = document.getElementById('logout-link');
  
    if (userName) {
      signInLink.classList.add('d-none');
      userInfo.classList.remove('d-none');
      userNameSpan.textContent = `Welcome, ${userName}`;
  
      logoutLink.addEventListener('click', function(event) {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
  
        fetch('/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            sessionStorage.removeItem('userName');
            window.location.href = '/login';
          } else {
            console.error('Logout failed');
          }
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
      });
    } else {
      signInLink.classList.remove('d-none');
      userInfo.classList.add('d-none');
      logoutLink.classList.add('d-none');
    }
  });
  