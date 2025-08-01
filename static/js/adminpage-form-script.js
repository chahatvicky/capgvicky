document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('enhc_id');
    const statusMessage = document.getElementById('status-message');
    const submitButton = document.getElementById('submit-button');
    const uploadFieldset = document.querySelector('.upload-section');
    const fileInput = document.getElementById('fsd_file');
    const fileNameDisplay = document.getElementById('file-name-display');
    let requiredFields = [];

    // Globals
    let processedFormDataObject = null;
    let processedFsdFile = null;

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
                const selectedFileName = fileInput.files[0].name;
                fileNameDisplay.textContent = `File Is Selected: ${selectedFileName}`;
            } else {
                fileNameDisplay.textContent = 'No file selected';
            }
        });
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
                showStatus('<i class="fas fa-times-circle"></i> FSD Document upload is required.', 'error');
                uploadFieldset?.classList.add('error-highlight');
                fileInput.focus();
                return;
            }

            const fsdFile = fileInput.files[0];
            if (!fsdFile.name.toLowerCase().endsWith('.xlsx')) {
                showStatus('<i class="fas fa-times-circle"></i> Please upload a .xlsx file.', 'error');
                fileInput.value = '';
                fileNameDisplay.textContent = 'No file selected';
                uploadFieldset?.classList.add('error-highlight');
                fileInput.focus();
                return;
            }

            processedFsdFile = fsdFile;
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
            apiFormData.append('fsd_file', fsdFile);
            for (const key in formDataObj) {
                apiFormData.append(key, formDataObj[key]);
            }

            const apiUrl = '/adminpage';
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: apiFormData,
                });
                if (response.ok) {
                    const msg = await response.json();
                    showStatus(`<i class="fas fa-check-circle"></i> File processed successfully.`, 'success');
                    resetSubmitButton();
                    // // Redirect to home page after successful submission
                    window.location.href = '/';
                } else {
                    const err = await response.json();
                    showStatus(`<i class="fas fa-times-circle"></i> Server Error: ${err.error}`, 'error');
                    resetSubmitButton();
                }
            } catch (err) {
                console.error('Request failed:', err);
                showStatus(`<i class="fas fa-times-circle"></i> Network Error: ${err.message}`, 'error');
                resetSubmitButton();
                alert(`Network Error: ${err.message}`); // Show network error message in alert box
            }
        });
    }

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
        submitButton.querySelector('span').innerHTML = `<i class="fas fa-paper-plane"></i> Submit Request`;
    }

    function resetFormAndButton() {
        form.reset();
        fileNameDisplay.textContent = 'No file selected';
        uploadFieldset?.classList.remove('error-highlight');
        processedFsdFile = null;
        processedFormDataObject = null;
        resetSubmitButton();
        updateProgress();
    }
});
