document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to equipment page
    if (authService.isAuthenticated()) {
        window.location.href = 'equipment.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const success = await authService.login(email, password);
            
            if (success) {
                // Update navigation before redirecting
                updateNavigation();
                window.location.href = 'equipment.html';
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    });
}); 