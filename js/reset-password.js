document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (!token || !email) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('newPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = this.querySelector('button[type="submit"]');

        try {
            if (newPassword !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            submitButton.disabled = true;
            submitButton.textContent = 'UPDATING...';

            // Find user record
            const findResponse = await fetch(`https://api.airtable.com/v0/app7an1IZnEt7BC2L/Members?filterByFormula={Email}="${email}"`, {
                headers: {
                    'Authorization': 'Bearer pat139sD45hTcrgqK.5366c618657ea4e6cc7df110504e2feb0191ce4004dd0272170962555beb3dc0'
                }
            });

            const findData = await findResponse.json();
            
            if (!findData.records || findData.records.length === 0) {
                throw new Error('User not found');
            }

            const recordId = findData.records[0].id;

            // Update password
            const updateResponse = await fetch(`https://api.airtable.com/v0/app7an1IZnEt7BC2L/Members/${recordId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer pat139sD45hTcrgqK.5366c618657ea4e6cc7df110504e2feb0191ce4004dd0272170962555beb3dc0',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        'Password': newPassword
                    }
                })
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update password');
            }

            // Show success message
            document.getElementById('newPasswordForm').style.display = 'none';
            document.getElementById('resetSuccess').style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            const errorDiv = document.getElementById('resetError');
            errorDiv.style.display = 'block';
            errorDiv.textContent = error.message === 'Passwords do not match'
                ? 'Passwords do not match. Please try again.'
                : 'Sorry, there was an error updating your password. Please try again.';
            
            submitButton.disabled = false;
            submitButton.textContent = 'UPDATE PASSWORD';
        }
    });
}); 