 document.getElementById('register-form').addEventListener('submit', async function(event) {
            event.preventDefault();


            document.getElementById('password-error').textContent = '';
            document.getElementById('confirm-error').textContent = '';
            document.getElementById('output').textContent = '';
            document.getElementById('output').className = '';

            // Get values
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validate password
            if (password.length < 8) {
                document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
                return;
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                document.getElementById('confirm-error').textContent = 'Passwords do not match!';
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, email, phone })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                // Show success message
                document.getElementById('output').textContent = data.message || 'Registration successful!';
                document.getElementById('output').className = 'success';
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                document.getElementById('output').textContent = error.message;
                document.getElementById('output').className = 'failure';
                console.error('Error:', error);
            }
        });

        // Real-time password confirmation check
        document.getElementById('confirm-password').addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            
            if (password && confirmPassword && password !== confirmPassword) {
                document.getElementById('confirm-error').textContent = 'Passwords do not match!';
            } else {
                document.getElementById('confirm-error').textContent = '';
            }
        });