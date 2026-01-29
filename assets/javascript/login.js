
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = document.getElementById('login-btn');
            const errorElement = document.getElementById('error');
            const identifier = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            errorElement.textContent = '';
            button.disabled = true;
            button.innerHTML = '<span class="spinner"></span> Logging in...';

            fetch(`${API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { 
                        throw new Error(err.error || 'Login failed'); 
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.token && data.user) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.user._id);
                    localStorage.setItem('role', data.user.role);
                    localStorage.setItem('username', data.user.username);
                    
                    if (data.user.role === 'superadmin' || data.user.role === 'admin') {
                        window.location.href = 'admin/admin-nav-page.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    throw new Error('Invalid login response');
                }
            })
            .catch(error => {
                errorElement.textContent = error.message;
                console.error('Login error:', error);
            })
            .finally(() => {
                button.disabled = false;
                button.innerHTML = 'Login';
            });
        });