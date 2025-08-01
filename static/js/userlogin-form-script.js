// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function () {
    // trigger user-logged-in event listner
    window.addEventListener('user-logged-in', () => {
        startLogoutTimer();
    });

    // Get references to form elements
    const form = document.getElementById('user-login-form');
    const submitButton = document.getElementById('submit-button');
    const email = document.getElementById('email-id');
    const password = document.getElementById('password');

    // Remove error highlighting when any input field gains focus
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.remove('input-error');
        });
    });

    // Highlights the input field with an error class and clears its value
    function highlightAndClear(input) {
        input.classList.add('input-error');
        input.value = '';
    }

    // Resets the submit button to its original state
    function resetButton() {
        submitButton.disabled = false;
        submitButton.innerHTML = '<span><i class="fas fa-user-check"></i>Login</span>';
    }

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submission behavior

        // Disable the button and show loading spinner
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-sync-alt fa-spin"></i> Logging in...';

        // Validate that the email is a valid Capgemini email
        const capgeminiEmailRegex = /^[a-zA-Z0-9._%+-]+@capgemini\.com$/;
        if (!capgeminiEmailRegex.test(email.value.trim())) {
            alert('Please Enter A Valid Capgemini Email Address');
            highlightAndClear(email);
            resetButton();
            return;
        }

        // Validate that the password is at least 8 characters long
        if (password.value.length < 8) {
            alert('Password Must Be At Least 8-Characters Long');
            highlightAndClear(password);
            resetButton();
            return;
        }

        // Prepare form data for submission
        const formData = new FormData(form);

        try {
            // Send form data to the server using fetch API
            const response = await fetch('/userlogin', {
                method: 'POST',
                body: formData
            });

            // Parse the JSON response
            const data = await response.json();
            alert(data.message);

            if (response.status === 200) {
                // Trigger logout timer start
                window.dispatchEvent(new Event('user-logged-in'));
                // Redirect to dashboard on successful login
                const redirectUrl = data.redirect_url || '/';
                window.location.href = redirectUrl;
            } else {
                // Reset form on failed login
                form.reset();
            }
        } catch (error) {
            // Handle network or server errors
            console.error('Login Error:', error);
            alert('An Unexpected Error Occurred, Please try again');
            form.reset();
        } finally {
            // Re-enable the submit button
            resetButton();
        }
    });
});