document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        window.location.href = 'account.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');

    async function handleLogin(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            console.log('Login attempt:', { email, password });
            
            const member = await authService.login(email, password);
            
            if (member) {
                console.log('Login successful, redirecting...');
                localStorage.setItem('member', JSON.stringify(member));
                window.dispatchEvent(new Event('auth-changed'));
                window.location.href = 'account.html';
                return;
            }
            
        } catch (error) {
            console.error('Login error:', error);
            alertUtils.showAlert(error.message || 'Login failed. Please try again.');
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 