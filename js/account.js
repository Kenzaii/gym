document.addEventListener('DOMContentLoaded', async () => {
    const member = authService.getCurrentMember();
    if (!member) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const accountContainer = document.querySelector('.account-container');
        accountContainer.innerHTML = ''; // Clear existing content

        // Create profile section
        const profileSection = createProfileSection(member);
        accountContainer.appendChild(profileSection);

        // Create a row container for both sections
        const rowContainer = document.createElement('div');
        rowContainer.className = 'details-row-container';

        // Create membership details section
        const membershipDetails = document.createElement('div');
        membershipDetails.className = 'membership-details';
        membershipDetails.innerHTML = `
            <h2>Membership Details</h2>
            <div class="details-grid">
                <div class="detail-item">
                    <label>Member ID:</label>
                    <span class="member-id">${member.fields['Member ID'] || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span class="member-email">${member.fields['Email']}</span>
                </div>
                <div class="detail-item">
                    <label>Join Date:</label>
                    <span class="join-date">${formatDate(member.fields['Join Date'])}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="account-status">
                        <span class="status-badge status-${member.fields['Status'].toLowerCase()}">${member.fields['Status']}</span>
                    </span>
                </div>
            </div>
        `;

        // Create quick actions section
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        quickActions.innerHTML = `
            <h2>Quick Actions</h2>
            <div class="actions-grid">
                <a href="equipment.html" class="action-button">Book Equipment</a>
                <a href="membership.html" class="action-button">Upgrade Membership</a>
            </div>
        `;

        // Add both sections to the row container
        rowContainer.appendChild(membershipDetails);
        rowContainer.appendChild(quickActions);

        // Add row container to account container
        accountContainer.appendChild(rowContainer);

        // Create and append bookings section
        const bookingsSection = document.createElement('div');
        bookingsSection.className = 'active-bookings';
        bookingsSection.innerHTML = `
            <h2>Active Bookings</h2>
            <div class="active-bookings-list"></div>
        `;
        accountContainer.appendChild(bookingsSection);

        // Load and display bookings
        const bookingsList = bookingsSection.querySelector('.active-bookings-list');
        const bookings = await bookingService.getMemberBookings(member.id);
        
        if (bookings && bookings.length > 0) {
            for (const booking of bookings) {
                if (booking.fields['Equipment'] && booking.fields['Equipment'][0]) {
                    const equipmentId = booking.fields['Equipment'][0];
                    const equipment = await bookingService.getEquipmentDetails(equipmentId);
                    if (equipment) {
                        booking.equipmentDetails = equipment;
                    }
                }
                
                const qrData = {
                    bookingId: booking.id,
                    memberId: member.id,
                    equipmentId: booking.fields['Equipment']?.[0],
                    date: booking.fields['Booking Date'],
                    time: booking.fields['Start Time']
                };
                
                booking.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`;
                
                const bookingElement = createBookingElement(booking);
                bookingsList.appendChild(bookingElement);
            }
        } else {
            bookingsList.innerHTML = '<p>No active bookings found.</p>';
        }

    } catch (error) {
        console.error('Error loading account data:', error);
        alertUtils.showAlert('Error loading account data. Please try again.');
    }
});

function createBookingElement(booking) {
    const bookingDiv = document.createElement('div');
    bookingDiv.className = 'booking-item';
    
    const equipmentDetails = booking.equipmentDetails;
    const equipmentName = equipmentDetails?.fields['Equipment Name'] || 'Unknown Equipment';
    const equipmentCategory = equipmentDetails?.fields['Category'] || 'N/A';
    const equipmentLocation = equipmentDetails?.fields['Location'] || 'N/A';
    
    const bookingDate = formatDate(booking.fields['Booking Date']);
    const startTime = formatTime(booking.fields['Start Time']);
    const status = booking.fields['Status'];
    const bookingId = booking.id;

    bookingDiv.innerHTML = `
        <div class="booking-details">
            <div class="equipment-info">
                <h4 class="equipment-name">${equipmentName}</h4>
                <p class="equipment-meta">${equipmentCategory} • ${equipmentLocation}</p>
                <div class="booking-meta">
                    <p><strong>Booking ID:</strong> ${bookingId}</p>
                    <p><strong>Date:</strong> ${bookingDate}</p>
                    <p><strong>Time:</strong> ${startTime}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${status.toLowerCase()}">${status}</span></p>
                </div>
            </div>
        </div>
        <div class="qr-code-section">
            <p class="qr-code-label">QR Code</p>
            <img src="${booking.qrCode}" alt="Booking QR Code" class="qr-code-image">
        </div>
    `;

    return bookingDiv;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function createQuickActions() {
    const actionsDiv = document.querySelector('.quick-actions');
    if (actionsDiv) {
        actionsDiv.innerHTML = `
            <a href="equipment.html" class="action-button">Book Equipment</a>
            <a href="membership.html" class="action-button">Upgrade Membership</a>
        `;
    }
}

function createProfileSection(member) {
    const profileSection = document.createElement('div');
    profileSection.className = 'profile-header';
    
    const profilePicture = member.fields['Profile Picture']?.[0]?.url || 'images/default-avatar.png';
    
    profileSection.innerHTML = `
        <div class="profile-info">
            <h1>Welcome, ${member.fields['Full Name']}</h1>
            <p class="membership-status">Membership: ${member.fields['Membership Tier'] || 'Basic'}</p>
        </div>
        <div class="profile-picture-container">
            <img src="${profilePicture}" alt="Profile Picture" class="profile-picture">
            <label for="profile-upload" class="upload-button">
                <i class="fas fa-camera"></i>
                <span>Update Photo</span>
            </label>
            <input type="file" id="profile-upload" accept="image/*" style="display: none;">
        </div>
    `;

    // Add upload functionality
    const fileInput = profileSection.querySelector('#profile-upload');
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                // Show loading state
                const profileImg = profileSection.querySelector('.profile-picture');
                profileImg.style.opacity = '0.5';
                
                // Upload to Airtable
                const updatedMember = await updateProfilePicture(member.id, file);
                
                // Update UI with new image
                if (updatedMember.fields['Profile Picture']?.[0]?.url) {
                    profileImg.src = updatedMember.fields['Profile Picture'][0].url;
                }
                
                profileImg.style.opacity = '1';
                alertUtils.showAlert('Profile picture updated successfully!', 'success');
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                alertUtils.showAlert('Failed to update profile picture. Please try again.', 'error');
            }
        }
    });

    return profileSection;
}

// Add Airtable configuration
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0/app7an1IZnEt7BC2L';
const AIRTABLE_API_KEY = 'pat139sD45hTcrgqK.5366c618657ea4e6cc7df110504e2feb0191ce4004dd0272170962555beb3dc0';

async function updateProfilePicture(file) {
    try {
        console.log('Starting profile picture update...', file);
        
        const member = authService.getCurrentMember();
        if (!member || !member.id) {
            throw new Error('No member logged in');
        }

        // Show loading state
        const profileImg = document.querySelector('.profile-picture');
        if (profileImg) {
            profileImg.style.opacity = '0.5';
        }

        // Convert file to base64
        const base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/png;base64,
            reader.onerror = reject;
        });

        // Prepare the update data
        const updateData = {
            records: [{
                id: member.id,
                fields: {
                    'Profile Picture': [{
                        filename: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64String
                    }]
                }
            }]
        };

        console.log('Sending update request to Airtable...');

        const response = await fetch(`${AIRTABLE_BASE_URL}/Members`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        console.log('Airtable response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Airtable error response:', errorText);
            throw new Error(`Failed to update profile picture: ${errorText}`);
        }

        const result = await response.json();
        console.log('Airtable success response:', result);
        
        // Update UI with new image URL
        if (result.records?.[0]?.fields?.['Profile Picture']?.[0]?.url) {
            if (profileImg) {
                profileImg.src = result.records[0].fields['Profile Picture'][0].url;
                profileImg.style.opacity = '1';
            }
            alertUtils.showAlert('Profile picture updated successfully!', 'success');
        } else {
            throw new Error('Invalid response from server - missing image URL');
        }

    } catch (error) {
        console.error('Detailed error in updateProfilePicture:', {
            error,
            message: error.message,
            stack: error.stack
        });
        
        const profileImg = document.querySelector('.profile-picture');
        if (profileImg) {
            profileImg.style.opacity = '1';
        }
        alertUtils.showAlert(`Failed to update profile picture: ${error.message}`);
    }
}

// Add event listener for file input
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.querySelector('#profile-upload');
    if (fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log('File selected:', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                try {
                    await updateProfilePicture(file);
                } catch (error) {
                    console.error('Error in file input handler:', error);
                    alertUtils.showAlert('Failed to update profile picture. Please try again.');
                }
            }
        });
    }
}); 