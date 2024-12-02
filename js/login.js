document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to equipment page
    if (authService.isAuthenticated()) {
        window.location.href = 'equipment.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    
    // Add this HTML to your login page, just after the body tag opens
    const spinnerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">Logging in...</div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', spinnerHTML);
    
    // Update your login handler
    async function handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const spinner = document.querySelector('.loading-spinner');
        spinner.classList.add('active');
        
        try {
            console.log('Attempting login with:', { email, password }); // Debug log

            const response = await authService.login(email, password);
            console.log('Login response:', response); // Debug log

            if (response && response.records && response.records.length > 0) {
                const member = response.records[0];
                console.log('Member data:', member); // Debug log

                // Store member data
                localStorage.setItem('currentMember', JSON.stringify({
                    id: member.id,
                    email: member.fields.Email,
                    name: member.fields.Name
                }));

                // Dispatch auth changed event
                window.dispatchEvent(new Event('auth-changed'));

                // Show success message and redirect
                alertUtils.showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'account.html';
                }, 1500);
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alertUtils.showAlert(error.message || 'Login failed. Please try again.');
            spinner.classList.remove('active');
        }
    }
    
    // Add event listener for form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 