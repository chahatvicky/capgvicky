document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('enhancement-form');
    const statusMessage = document.getElementById('status-message');
    const submitButton = document.getElementById('submit-button');
    const fileInput = document.getElementById('sop-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const uploadFieldset = document.querySelector('.upload-section');
    const progressBarFill = document.getElementById('form-progress-bar');
    const progressText = document.getElementById('form-progress-text');
    const itsmToolSelect = document.getElementById('itsm-tool');
    const cloudOnPremSelect = document.getElementById('cloud-on-prem');
    let requiredFields = [];

    // Globals
    let processedFormDataObject = null;
    let processedSopFile = null;

    // Initialize form and event listeners
    if (form) {
        requiredFields = Array.from(form.querySelectorAll('[required]'));
        updateProgress();
        form.addEventListener('input', updateProgress);
        form.addEventListener('change', updateProgress);
    }

    // File Input Event: Handle file selection
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
                uploadFieldset?.classList.remove('error-highlight');
            } else {
                fileNameDisplay.textContent = 'No file selected';
            }
        });
    }

    // SNOW INTEGRATION Event: Enable/Disable SNOW INSTANCE
    if (itsmToolSelect && cloudOnPremSelect) {
        itsmToolSelect.addEventListener('change', () => {
            if (itsmToolSelect.value === 'Yes') {
                cloudOnPremSelect.removeAttribute('disabled');
            } else {
                cloudOnPremSelect.setAttribute('disabled', true);
                cloudOnPremSelect.value = ''; // Reset the value if set to No
            }
        });

        // Initial check on page load
        if (itsmToolSelect.value !== 'Yes') {
            cloudOnPremSelect.setAttribute('disabled', true);
        }
    }

    // Form Submit Event: Handle form submission
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideStatus();
            uploadFieldset?.classList.remove('error-highlight');

            // Validate form
            if (!form.checkValidity()) {
                showStatus('<i class="fas fa-exclamation-triangle"></i> Please complete all required fields.', 'error');
                form.reportValidity();
                form.querySelector(':invalid')?.focus();
                return;
            }

            // Validate file input
            if (!fileInput.files || fileInput.files.length === 0) {
                showStatus('<i class="fas fa-times-circle"></i> SOP Document upload is required.', 'error');
                uploadFieldset?.classList.add('error-highlight');
                fileInput.focus();
                return;
            }

            const sopFile = fileInput.files[0];
            if (!sopFile.name.toLowerCase().endsWith('.docx')) {
                showStatus('<i class="fas fa-times-circle"></i> Please upload a .docx file.', 'error');
                fileInput.value = '';
                fileNameDisplay.textContent = 'No file selected';
                uploadFieldset?.classList.add('error-highlight');
                fileInput.focus();
                return;
            }

            processedSopFile = sopFile;
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            showStatus('<i class="fas fa-sync-alt fa-spin"></i> Processing...', 'loading');

            // Collect form data
            const formDataObj = {};
            for (let el of form.elements) {
                if (el.name && el.type !== 'submit' && el.type !== 'file' && el.tagName !== 'FIELDSET') {
                    formDataObj[el.name] = el.value.trim();
                }
            }
            processedFormDataObject = formDataObj;

            // Prepare data for API request
            const apiFormData = new FormData();
            apiFormData.append('sop_file', sopFile);
            for (const key in formDataObj) {
                apiFormData.append(key, formDataObj[key]);
            }

            const apiUrl = '/newrequest';
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: apiFormData,
                });

                if (response.ok) {
                    const msg = await response.json();
                    showStatus(`<i class="fas fa-check-circle"></i> File processed successfully.`, 'success');
                    resetSubmitButton();
                    // Display success message in alert box
                    alert(msg.message);
                    // Redirect to home page after successful submission
                    window.location.href = '/';
                } else {
                    const err = await response.json();
                    showStatus(`<i class="fas fa-times-circle"></i> Server Error: ${err.error}`, 'error');
                    resetSubmitButton();
                    // Display error message in alert box
                    alert(err.error);
                }
            } catch (err) {
                console.error('Request failed:', err);
                showStatus(`<i class="fas fa-times-circle"></i> Network Error: ${err.message}`, 'error');
                resetSubmitButton();
                // Display network error message in alert box
                alert(`Network Error: ${err.message}`);
            }
        });
    }

    // --- Helpers ---
    function updateProgress() {
        let filled = requiredFields.filter(field => {
            if (field.type === 'file') return field.files.length > 0;
            if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
            return field.value.trim() !== '';
        }).length;
        const percent = Math.round((filled / requiredFields.length) * 100);
        progressBarFill.style.width = `${percent}%`;
        progressText.textContent = `${percent}% Complete`;
    }

    function showStatus(msg, type = 'info') {
        if (!statusMessage) return;
        statusMessage.innerHTML = msg;
        statusMessage.className = `show ${type}`;
    }

    function hideStatus() {
        if (statusMessage) {
            statusMessage.className = '';
            statusMessage.innerHTML = '';
        }
    }

    function resetSubmitButton() {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.querySelector('span').innerHTML = `<i class="fas fa-paper-plane"></i> Submit Enhancement Request`;
    }

    function resetFormAndButton() {
        form.reset();
        fileNameDisplay.textContent = 'No file selected';
        uploadFieldset?.classList.remove('error-highlight');
        processedSopFile = null;
        processedFormDataObject = null;
        resetSubmitButton();
        updateProgress();
    }
});
