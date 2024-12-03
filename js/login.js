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
            loadingUtils.show();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            console.log('Login attempt:', { email, password });
            
            const member = await authService.login(email, password);
            console.log('Login successful:', member);
            
            window.location.href = 'account.html';
        } catch (error) {
            console.error('Login error:', error);
            alertUtils.showAlert(error.message);
        } finally {
            loadingUtils.hide();
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 