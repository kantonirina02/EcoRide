// Get references to the buttons and form
const driverBtn = document.getElementById('driverBtn');
const passengerBtn = document.getElementById('passengerBtn');
const bothBtn = document.getElementById('bothBtn');
const driverForm = document.getElementById('driverForm');

// Add event listeners to the buttons
driverBtn.addEventListener('click', () => {
    driverForm.classList.add('visible');
    // TODO: Add logic to show driver-specific information
});


passengerBtn.addEventListener('click', () => {
    driverForm.classList.remove('visible');
    // TODO: Add logic to show passenger-specific information
});


bothBtn.addEventListener('click', () => {
    driverForm.classList.add('visible');
    // TODO: Add logic to show information for both roles
});


// Add event listener for edit info button
const editInfoBtn = document.getElementById('editInfoBtn');
editInfoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Implement edit functionality
});
