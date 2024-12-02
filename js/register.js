document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const memberData = {
                'Full Name': name,
                'Email': email,
                'Password': password,
                'Status': 'Active',
                'Join Date': new Date().toISOString().split('T')[0],
                'Membership Tier': 'Basic'
            };

            console.log('Submitting member data:', memberData);
            await authService.register(memberData);

            alertUtils.showAlert('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            alertUtils.showAlert(error.message || 'Registration failed. Please try again.');
        }
    });
}); 