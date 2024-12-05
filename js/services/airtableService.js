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
    },

    async getAllEquipment() {
        try {
            console.log('Fetching equipment from URL:', `${this.baseUrl}/Equipment?view=Grid%20view`);
            
            const response = await fetch(`${this.baseUrl}/Equipment?view=Grid%20view`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable API error:', errorData);
                throw new Error(`Failed to fetch equipment: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched equipment data:', data);
            
            if (!data.records || data.records.length === 0) {
                console.log('No equipment records found in Airtable');
                return [];
            }

            return data.records;
        } catch (error) {
            console.error('Error in getAllEquipment:', error);
            throw error;
        }
    },

    async getBookingsByDate(date) {
        try {
            const filterByFormula = encodeURIComponent(`AND(IS_SAME({Booking Date}, '${date}', 'day'), {Status} = 'Confirmed')`);
            const response = await fetch(`${this.baseUrl}/Bookings?filterByFormula=${filterByFormula}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const data = await response.json();
            return data.records;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    async createBooking(bookingData) {
        try {
            console.log('Step 1: Preparing booking data');

            // Generate a temporary ID for the QR code
            const tempId = Date.now().toString();
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BOOKING-${tempId}`;
            
            // Combine the booking data with the QR code
            const completeBookingData = {
                records: [{
                    fields: {
                        ...bookingData.fields,
                        'QR Code': qrCodeUrl  // Include QR code URL in initial creation
                    }
                }]
            };

            console.log('Step 2: Sending booking data:', completeBookingData);

            // Create the booking with all data at once
            const response = await fetch(`${this.baseUrl}/Bookings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(completeBookingData)
            });

            console.log('Step 3: Response status:', response.status);
            const responseData = await response.json();
            console.log('Step 4: Response data:', responseData);

            if (!response.ok) {
                console.error('Booking creation failed:', responseData);
                throw new Error('Failed to create booking');
            }

            return responseData;

        } catch (error) {
            console.error('Error in createBooking:', error);
            throw error;
        }
    },

    async updateEquipmentStatus(equipmentId, status) {
        try {
            const response = await fetch(`${this.baseUrl}/Equipment/${equipmentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        'Status': status
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update equipment status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating equipment status:', error);
            throw error;
        }
    }
};