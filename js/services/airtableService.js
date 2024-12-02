const airtableService = {
    baseUrl: 'https://api.airtable.com/v0/app7an1IZnEt7BC2L',
    apiKey: 'pat139sD45hTcrgqK.5366c618657ea4e6cc7df110504e2feb0191ce4004dd0272170962555beb3dc0',

    async fetchRecords(table, params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const url = `${this.baseUrl}/${table}${queryParams ? '?' + queryParams : ''}`;
            
            console.log('Fetching from URL:', url); // Debug log
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable error response:', errorData);
                throw new Error(errorData.error?.message || 'Failed to fetch from Airtable');
            }

            const data = await response.json();
            console.log(`Fetched ${table} data:`, data); // Debug log
            return data;
        } catch (error) {
            console.error('Airtable fetch error:', error);
            throw error;
        }
    },

    async createRecord(table, fields) {
        try {
            const url = `${this.baseUrl}/${table}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable error response:', errorData);
                throw new Error(errorData.error?.message || 'Failed to create record');
            }

            return await response.json();
        } catch (error) {
            console.error('Airtable create error:', error);
            throw error;
        }
    }
};