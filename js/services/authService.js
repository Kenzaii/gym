const authService = {
    getCurrentMember() {
        const memberData = localStorage.getItem('member');
        return memberData ? JSON.parse(memberData) : null;
    },

    isAuthenticated() {
        const member = this.getCurrentMember();
        return member !== null && member.id;
    },

    async login(email, password) {
        try {
            console.log('Attempting login with:', { email, password });
            const response = await airtableService.fetchRecords('Members');
            const members = response.records;
            
            console.log('Fetched Members data:', members);

            const member = members.find(m => 
                m.fields.Email === email && 
                m.fields.Password === password
            );

            if (member) {
                console.log('Login successful:', member);
                localStorage.setItem('member', JSON.stringify(member));
                window.dispatchEvent(new Event('auth-changed'));
                return member;
            }
            
            throw new Error('Invalid email or password');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async logout() {
        localStorage.removeItem('member');
        window.dispatchEvent(new Event('auth-changed'));
        window.location.href = 'login.html';
    },

    async register(memberData) {
        try {
            // Check if email already exists
            const response = await airtableService.fetchRecords('Members');
            const members = response.records;
            
            const emailExists = members.some(m => 
                m.fields.Email === memberData.Email
            );

            if (emailExists) {
                throw new Error('Email already registered');
            }

            // Create new member
            await airtableService.createRecord('Members', memberData);
            
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
}; 