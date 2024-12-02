const headers = {
    'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
    'Content-Type': 'application/json'
};

const baseUrl = `${AIRTABLE_CONFIG.API_URL}/${AIRTABLE_CONFIG.BASE_ID}`;

const airtableService = {
    async fetchRecords(table, formula = null) {
        try {
            let url = `${AIRTABLE_CONFIG.API_URL}/${AIRTABLE_CONFIG.BASE_ID}/${table}`;
            if (formula) {
                url += `?filterByFormula=${encodeURIComponent(formula)}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched records:', data); // Debug log
            return data.records;
        } catch (error) {
            console.error('Airtable fetch error:', error);
            throw error;
        }
    },

    async createRecord(table, fields) {
        try {
            const url = `${AIRTABLE_CONFIG.API_URL}/${AIRTABLE_CONFIG.BASE_ID}/${table}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    records: [{
                        fields: fields
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable error response:', errorData);
                throw new Error(errorData.error.message);
            }

            const data = await response.json();
            return data.records[0];
        } catch (error) {
            console.error('Airtable create error:', error);
            throw error;
        }
    },

    async updateRecord(table, recordId, fields) {
        const response = await fetch(`${baseUrl}/${table}/${recordId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ fields })
        });
        return await response.json();
    }
};