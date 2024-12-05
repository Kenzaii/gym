class FloorPlan {
    constructor() {
        this.zones = {
            zone1: document.querySelector('#zone1 .equipment-grid'),
            zone2: document.querySelector('#zone2 .equipment-grid'),
            zone3: document.querySelector('#zone3 .equipment-grid')
        };
        this.currentBookings = new Map();
        this.updateInterval = null;
    }

    async initialize() {
        await this.loadEquipment();
        this.startTimeUpdate();
        this.startLiveUpdate();
        this.setupStatusChangeListeners();
    }

    setupStatusChangeListeners() {
        document.querySelectorAll('.change-status-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const equipmentElement = event.target.closest('.equipment-item');
                if (equipmentElement) {
                    this.toggleEquipmentStatus(equipmentElement);
                }
            });
        });
    }

    toggleEquipmentStatus(equipmentElement) {
        const currentStatus = equipmentElement.classList.contains('occupied') ? 'occupied' : 'available';
        const newStatus = currentStatus === 'occupied' ? 'available' : 'occupied';
        equipmentElement.classList.toggle('occupied');
        equipmentElement.classList.toggle('available');
        equipmentElement.querySelector('.status').textContent = `Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;

        // Update Airtable
        const equipmentId = equipmentElement.id.replace('equipment-', '');
        this.updateAirtableStatus(equipmentId, newStatus);
    }

    async updateAirtableStatus(equipmentId, status) {
        try {
            const response = await fetch(`${airtableService.baseUrl}/Bookings/${equipmentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${airtableService.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        'Status': status.charAt(0).toUpperCase() + status.slice(1)
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update status in Airtable:', errorData);
                alert('Failed to update status in Airtable.');
            } else {
                console.log('Status updated in Airtable successfully.');
            }
        } catch (error) {
            console.error('Error updating status in Airtable:', error);
            alert('Error updating status in Airtable.');
        }
    }

    startTimeUpdate() {
        const updateDateTime = () => {
            const now = new Date();
            
            // Update time
            document.getElementById('currentTime').textContent = 
                now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                });
            
            // Update date
            document.getElementById('currentDate').textContent = 
                now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
        };
        
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    startLiveUpdate() {
        // Update equipment status every 30 seconds
        this.updateInterval = setInterval(() => this.updateEquipmentStatus(), 30000);
    }

    async loadEquipment() {
        try {
            console.log('Loading equipment...');
            const equipment = await airtableService.getAllEquipment();
            console.log('Equipment loaded:', equipment);

            if (!equipment || equipment.length === 0) {
                console.log('No equipment data available');
                Object.values(this.zones).forEach(zone => {
                    zone.innerHTML = '<p>No equipment available in this zone</p>';
                });
                return;
            }

            this.renderEquipment(equipment);
            await this.updateEquipmentStatus();
        } catch (error) {
            console.error('Error loading equipment:', error);
            Object.values(this.zones).forEach(zone => {
                zone.innerHTML = '<p>Error loading equipment</p>';
            });
        }
    }

    renderEquipment(equipment) {
        // Clear existing equipment
        Object.values(this.zones).forEach(zone => zone.innerHTML = '');

        equipment.forEach(item => {
            // Extract zone number from Location field
            const location = item.fields.Location; // e.g., "Zone 1"
            if (!location) {
                console.log('Skipping item without location:', item);
                return;
            }

            // Extract the number from "Zone X"
            const zoneNumber = location.replace('Zone ', '');
            const zone = this.zones[`zone${zoneNumber}`];
            
            if (zone) {
                const equipmentElement = this.createEquipmentElement(item);
                zone.appendChild(equipmentElement);
            } else {
                console.log('Invalid zone for equipment:', item);
            }
        });
    }

    createEquipmentElement(item) {
        const div = document.createElement('div');
        const currentStatus = item.fields['Status'] || 'Available';
        div.className = `equipment-item ${currentStatus.toLowerCase().replace(' ', '-')}`;
        div.id = `equipment-${item.id}`;
        
        // Store initial status
        div.dataset.currentStatus = currentStatus;

        div.innerHTML = `
            <h4>${item.fields['Equipment Name'] || 'Unnamed Equipment'}</h4>
            <div class="equipment-details">
                <p>Type: ${item.fields['Equipment Type'] || 'Unknown'}</p>
                <p class="status">Status: ${currentStatus}</p>
                <select class="status-select" data-equipment-id="${item.id}">
                    <option value="Available" ${currentStatus === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Reserved" ${currentStatus === 'Reserved' ? 'selected' : ''}>Reserved</option>
                    <option value="Under Maintenance" ${currentStatus === 'Under Maintenance' ? 'selected' : ''}>Under Maintenance</option>
                </select>
            </div>
        `;

        // Add change handler for the status select
        const statusSelect = div.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => this.handleStatusChange(div, item.id, e.target.value));
        
        return div;
    }

    async handleStatusChange(equipmentElement, equipmentId, newStatus) {
        try {
            // Store the new status in a data attribute
            equipmentElement.dataset.currentStatus = newStatus;
            
            // Remove all status classes
            equipmentElement.classList.remove('available', 'reserved', 'under-maintenance');
            // Add new status class
            equipmentElement.classList.add(newStatus.toLowerCase().replace(' ', '-'));
            
            // Update status text
            equipmentElement.querySelector('.status').textContent = `Status: ${newStatus}`;
            
            // Update the select element to reflect the current status
            const selectElement = equipmentElement.querySelector('.status-select');
            selectElement.value = newStatus;

            // Update equipment status in Airtable
            await airtableService.updateEquipmentStatus(equipmentId, newStatus);
            console.log('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update equipment status. Please try again.');
            
            // Revert UI changes if update failed
            this.loadEquipment(); // Reload the current state
        }
    }

    async updateEquipmentStatus() {
        try {
            const equipment = await airtableService.getAllEquipment();
            equipment.forEach(item => {
                const equipmentElement = document.getElementById(`equipment-${item.id}`);
                if (equipmentElement) {
                    // Check if there's a manually set status
                    const manualStatus = equipmentElement.dataset.currentStatus;
                    if (manualStatus) {
                        // Keep the manual status
                        return;
                    }

                    // Otherwise, update with the status from Airtable
                    const status = item.fields.Status || 'Available';
                    equipmentElement.classList.remove('available', 'reserved', 'under-maintenance');
                    equipmentElement.classList.add(status.toLowerCase().replace(' ', '-'));
                    equipmentElement.querySelector('.status').textContent = `Status: ${status}`;
                    
                    // Update the select element
                    const selectElement = equipmentElement.querySelector('.status-select');
                    if (selectElement) {
                        selectElement.value = status;
                    }
                }
            });
        } catch (error) {
            console.error('Error updating equipment status:', error);
        }
    }

    calculateEndTime(startTime) {
        const [hours, minutes] = startTime.split(':');
        const endDate = new Date();
        endDate.setHours(parseInt(hours));
        endDate.setMinutes(parseInt(minutes) + 60); // 1-hour sessions
        return endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    isCurrentlyOccupied(startTime, endTime) {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return currentTime >= startTime && currentTime <= endTime;
    }

    showEquipmentDetails(item) {
        // You can implement a modal or tooltip here to show more details
        console.log('Equipment details:', item);
    }
}

// Initialize the floor plan when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const floorPlan = new FloorPlan();
    floorPlan.initialize();
}); 