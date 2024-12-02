const authService = {
    async login(email, password) {
        try {
            const formula = `AND({Email} = '${email}', {Password} = '${password}')`;
            const records = await airtableService.fetchRecords(TABLES.MEMBERS, formula);
            
            if (records && records.length > 0) {
                const member = records[0];
                const memberData = {
                    id: member.id,
                    email: member.fields.Email,
                    fullName: member.fields['Full Name'],
                    membershipTier: member.fields['Membership Tier']
                };
                
                localStorage.setItem('currentMember', JSON.stringify(memberData));
                
                window.dispatchEvent(new Event('auth-changed'));
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    isAuthenticated() {
        return localStorage.getItem('currentMember') !== null;
    },

    logout() {
        localStorage.removeItem('currentMember');
        window.dispatchEvent(new Event('auth-changed'));
    },

    getCurrentMember() {
        const memberData = localStorage.getItem('currentMember');
        return memberData ? JSON.parse(memberData) : null;
    }
}; 