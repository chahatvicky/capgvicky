// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function () {
    // Get references to the form and submit button
    const form = document.getElementById('admin-registration-form');
    const submitButton = document.getElementById('submit-button');

    // Define masked input fields and their corresponding hidden real input fields
    const maskedFields = [
        { visible: 'masked-password', hidden: 'real-password' },
        { visible: 'masked-confirm-password', hidden: 'real-confirm-password' },
        { visible: 'masked-admin-password', hidden: 'real-admin-password' }
    ];

    // Handle masking logic for each password field
    maskedFields.forEach(field => {
        const input = document.getElementById(field.visible);
        input.dataset.lastLength = 0;

        input.addEventListener('input', () => {
            const realInput = document.getElementById(field.hidden);
            const currentValue = input.value;

            // Append or remove characters from the real input based on user typing
            if (currentValue.length > input.dataset.lastLength) {
                realInput.value += currentValue.slice(-1);
            } else {
                realInput.value = realInput.value.slice(0, -1);
            }

            // Replace visible input with masking characters
            input.value = '#'.repeat(realInput.value.length);
            input.dataset.lastLength = input.value.length;
        });
    });

    // Highlight input field with error and clear its value
    function highlightAndClear(input, hiddenInput = null) {
        input.classList.add('input-error');
        input.value = '';
        input.dataset.lastLength = 0;
        if (hiddenInput) hiddenInput.value = '';
    }

    // Remove error highlight when user focuses on an input field
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.remove('input-error');
        });
    });

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Disable submit button and show loading spinner
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-sync-alt fa-spin"></i> Processing...';

        // Get references to all relevant input fields
        const email = document.getElementById('admin-email-id');
        const empId = document.getElementById('admin-emp-id');
        const realPassword = document.getElementById('real-password');
        const confirmPassword = document.getElementById('real-confirm-password');
        const adminPassword = document.getElementById('real-admin-password');
        const adminEmail = document.getElementById('super-admin-email-id');
        const maskedPassword = document.getElementById('masked-password');
        const maskedConfirmPassword = document.getElementById('masked-confirm-password');
        const maskedAdminPassword = document.getElementById('masked-admin-password');

        // Validate email format
        if (!email.value.includes('@capgemini.com')) {
            alert('Email Must Be A Valid Capgemini Address');
            highlightAndClear(email);
            resetButton();
            return;
        }

        // Validate employee ID format (must be exactly 8 digits, numbers only)
        if (!/^\d{8}$/.test(empId.value)) {
            alert('Employee ID Must Be Exactly 8-Digits And Contain Only Numbers');
            highlightAndClear(empId);
            resetButton();
            return;
        }

        // Validate password length (at least 8 characters)
        if (realPassword.value.length < 8) {
            alert('Password Must Be At Least 8-Characters Long');
            highlightAndClear(maskedPassword, realPassword);
            resetButton();
            return;
        }

        // Validate confirm password length (at least 8 characters)
        if (confirmPassword.value.length < 8) {
            alert('Confirm Password Must Be At Least 8-Characters Long');
            highlightAndClear(maskedConfirmPassword, confirmPassword);
            resetButton();
            return;
        }

        // Check if passwords match
        if (realPassword.value !== confirmPassword.value) {
            alert('Passwords And Confirm Password Does Not Match');
            highlightAndClear(maskedPassword, realPassword);
            highlightAndClear(maskedConfirmPassword, confirmPassword);
            resetButton();
            return;
        }

        // Validate super admin email format
        if (!adminEmail.value.includes('@capgemini.com')) {
            alert('Super Admin Email Must Be A Valid Capgemini Address');
            highlightAndClear(adminEmail);
            resetButton();
            return;
        }

        // Validate super admin password length (must be more than 12 characters)
        if (adminPassword.value.length < 10) {
            alert('Super Admin Password Must Ae Least 12-Characters Long');
            highlightAndClear(maskedAdminPassword, adminPassword);
            resetButton();
            return;
        }

        // Prepare form data for submission
        const formData = new FormData(form);

        try {
            // Send form data to the server
            const response = await fetch('/registeradmin', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            alert(data.message);

            // Redirect on success or reset form on failure
            if (response.status === 200) {
                window.location.href = '/';
            } else {
                form.reset();
                maskedFields.forEach(field => {
                    const input = document.getElementById(field.visible);
                    input.value = '';
                    input.dataset.lastLength = 0;
                });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An Unexpected Error Occurred, Please Try Again');
            form.reset();
        } finally {
            resetButton(); // Re-enable the submit button
        }
    });

    // Reset the submit button to its original state
    function resetButton() {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-user-check"></i> Register Admin';
    }
});