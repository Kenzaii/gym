const airtableService = {
    baseUrl: 'https://api.airtable.com/v0/app7an1IZnEt7BC2L',
    apiKey: 'pat139sD45hTcrgqK.5366c618657ea4e6cc7df110504e2feb0191ce4004dd0272170962555beb3dc0',

    async fetchRecords(tableName, params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const url = `${this.baseUrl}/${tableName}${queryParams ? '?' + queryParams : ''}`;
            
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Airtable API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Airtable fetch error:', error);
            throw error;
        }
    },

    async fetchRecord(tableName, recordId) {
        try {
            const url = `${this.baseUrl}/${tableName}/${recordId}`;
            console.log('Fetching single record from URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Airtable API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Airtable fetch record error:', error);
            throw error;
        }
    },

    async createRecord(tableName, fields) {
        try {
            const url = `${this.baseUrl}/${tableName}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    records: [{
                        fields: fields
                    }]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to create record');
            }
            
            const result = await response.json();
            return result.records[0];
        } catch (error) {
            console.error('Airtable create error:', error);
            throw error;
        }
    },

    async updateRecord(tableName, recordId, fields) {
        try {
            const url = `${this.baseUrl}/${tableName}/${recordId}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: fields
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update record');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Airtable update error:', error);
            throw error;
        }
    }
};