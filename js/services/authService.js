const authService = {
    async login(email, password) {
        try {
            const filterFormula = `AND({Email} = '${email}', {Password} = '${password}')`;
            const response = await airtableService.fetchRecords('Members', {
                filterByFormula: filterFormula
            });
            
            console.log('Auth response:', response); // Debug log
            
            if (!response.records || response.records.length === 0) {
                throw new Error('Invalid email or password');
            }
            
            return response;
        } catch (error) {
            console.error('Auth error:', error);
            throw error;
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem('currentMember');
    },

    getCurrentMember() {
        const memberData = localStorage.getItem('currentMember');
        return memberData ? JSON.parse(memberData) : null;
    },

    logout() {
        localStorage.removeItem('currentMember');
        window.dispatchEvent(new Event('auth-changed'));
    }
}; 