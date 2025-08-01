// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function () {
    // Get references to form elements
    const form = document.getElementById('user-registration-form');
    const submitButton = document.getElementById('submit-button');
    const emailInput = document.getElementById('email-id');
    const empId = document.getElementById('emp-id');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    // Utility function: Highlight input field with error and clear its value
    function highlightAndClear(input) {
        input.classList.add('input-error');
        input.value = '';
    }

    // Reset the submit button to its original state
    function resetButton() {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-user-check"></i> Register User';
    }

    // Cooldown timer for Resend OTP button
    function startResendCooldown(button) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Please wait...';

        let cooldown = 120; // 2 minutes
        const originalText = '<i class="fa-solid fa-key"></i>Resend OTP';

        const interval = setInterval(() => {
            if (cooldown <= 0) {
                clearInterval(interval);
                button.disabled = false;
                button.innerHTML = originalText;
            } else {
                const mins = Math.floor(cooldown / 60);
                const secs = (cooldown % 60).toString().padStart(2, '0');
                button.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Wait ${mins}:${secs}`;
                cooldown--;
            }
        }, 1000);
    }

    // Remove red border on input focus
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => input.classList.remove('input-error'));
    });

    // Check if email is a valid Capgemini email
    function isValidCapgeminiEmail(email) {
        const capgeminiEmailRegex = /^[a-zA-Z0-9._%+-]+@capgemini\.com$/;
        return capgeminiEmailRegex.test(email);
    }

    // Handle registration form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-sync-alt fa-spin"></i> Processing...';

        const email = emailInput.value.trim();

        // Client-side validations
        if (!isValidCapgeminiEmail(email)) {
            alert('Please Enter A Valid Capgemini Email Address');
            highlightAndClear(emailInput);
            resetButton();
            return;
        }

        if (!/^\d{8}$/.test(empId.value)) {
            alert('Employee ID Must Be Exactly 8-Digits');
            highlightAndClear(empId);
            resetButton();
            return;
        }

        if (password.value.length < 9) {
            alert('Password Must Be More Than 8-Characters');
            highlightAndClear(password);
            resetButton();
            return;
        }

        if (confirmPassword.value.length < 9) {
            alert('Confirm Password Must Be More Than 8-Characters');
            highlightAndClear(confirmPassword);
            resetButton();
            return;
        }

        if (password.value !== confirmPassword.value) {
            alert('Passwords Do Not Match');
            highlightAndClear(password);
            highlightAndClear(confirmPassword);
            resetButton();
            return;
        }

        // Submit form data via Fetch API
        try {
            const formData = new FormData(form);
            const response = await fetch('/registeruser', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            alert(data.message);

            if (response.status === 200) {
                // Redirect on success
                window.location.href = '/';
            } else {
                // Clear form on failure
                form.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An Unexpected Error Occurred, Please Try Again');
            form.reset();
        } finally {
            resetButton();
        }
    });

    // Handle initial OTP send
    async function handleSendOtp(event) {
        const button = event?.currentTarget;
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-sync-alt fa-spin"></i> Sending OTP...';

        const email = emailInput.value.trim();

        if (!isValidCapgeminiEmail(email)) {
            alert('Please Enter A Valid Capgemini Email Address');
            highlightAndClear(emailInput);
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-key"></i>Send OTP';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('email_id', email);

            const response = await fetch('/sentotp', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === "SUCCESS") {
                alert(result.message || "OTP sent successfully.");

                // Hide email input and show OTP inputs
                document.getElementById('email-hidden').value = email;
                emailInput.parentElement.style.display = 'none';
                emailInput.disabled = true;
                document.getElementById('user-otp').parentElement.style.display = 'block';
                document.getElementById('validate-otp-button').parentElement.style.display = 'block';
                document.getElementById('resend-otp-button').parentElement.style.display = 'block';
                document.getElementById('send-otp-button').parentElement.style.display = 'none';

                // Start cooldown timer
                startResendCooldown(document.getElementById('resend-otp-button'));
            } else if (result.status === "INFO") {
                alert(result.message || "Redirecting To Login Page");
                window.location.href = "/userlogin";
            } else {
                alert(result.message || "Failed To Send OTP");
            }
        } catch (error) {
            alert("Failed To Send OTP. Please Try Again.");
            console.error(error);
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-key"></i>Send OTP';
        }
    }

    // Handle resend OTP action
    async function handleResendOtp(event) {
        const button = event?.currentTarget;
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-sync-alt fa-spin"></i> Resending OTP...';

        const email = emailInput.value.trim();

        if (!isValidCapgeminiEmail(email)) {
            alert('Invalid Email Address');
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-key"></i>Resend OTP';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('email_id', email);

            const response = await fetch('/sentotp', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === "SUCCESS") {
                alert(result.message || "OTP resent successfully.");
                startResendCooldown(button);
            } else {
                alert(result.message || "Failed to resend OTP.");
            }
        } catch (error) {
            alert("Resend Failed. Try again.");
            console.error(error);
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-key"></i>Resend OTP';
        }
    }

    // Handle OTP validation
    async function handleValidateOtp(event) {
        const button = event?.currentTarget;
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validating...';

        const email = document.getElementById('email-hidden').value;
        const otp = document.getElementById('user-otp').value.trim();

        if (!/^[a-zA-Z0-9]{6}$/.test(otp)) {
            alert("Please Enter A Valid 6-Character Alphanumeric OTP.");
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-key"></i>Validate OTP';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('email_id', email);
            formData.append('user_otp', otp);

            const response = await fetch('/validateotp', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                if (result.status === "SUCCESS") {
                    alert(result.message || "OTP Validated Successfully.");
                    // Show registration form after successful OTP validation
                    document.getElementById('user-details').style.display = 'block';
                    document.getElementById('user-otp').parentElement.style.display = 'none';
                    document.getElementById('validate-otp-button').style.display = 'none';
                    document.getElementById('resend-otp-button').style.display = 'none';
                } else if (result.status === "INFO") {
                    alert(result.message || "OTP validation Failed.");
                    window.location.href = "/registeruser";
                } else {
                    alert(result.message || "Failed To Validate OTP, Please Try Again After Sometime.");
                }
            }
        } catch (error) {
            alert("OTP Validation Failed, Please Try Again.");
            console.error(error);
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-key"></i>Validate OTP';
        }
    }

    // Register all event listeners
    document.getElementById('send-otp-button')?.addEventListener('click', handleSendOtp);
    document.getElementById('resend-otp-button')?.addEventListener('click', handleResendOtp);
    document.getElementById('validate-otp-button')?.addEventListener('click', handleValidateOtp);
});
