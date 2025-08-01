// Define logout timers
let logoutTimer;

function resetLogoutTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        window.location.href = "/logout";
    }, 10 * 60 * 1000); // 1 minutes
}

// Function to start the logout timer
function startLogoutTimer() {
    // Reset timer on user activity
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
        document.addEventListener(event, resetLogoutTimer);
    });
    // Start the timer initially
    resetLogoutTimer();
}

// Listen for login success event
window.addEventListener('user-logged-in', () => {
    startLogoutTimer();
});

// Disabled right-click user action
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// Disabled view page-source user action
document.addEventListener('keydown', function (event) {
    if (
        (event.ctrlKey && (event.key === 'u' || event.key === 'U')) ||
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J'))
    ) {
        event.preventDefault();
    }
});

// Disabled text-selection user action
document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('selectstart', function (event) {
        event.preventDefault();
    });
    document.body.addEventListener('mousedown', function (event) {
        event.preventDefault();
    });
});