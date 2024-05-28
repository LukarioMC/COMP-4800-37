/**
 * Displays a toast message in the page's toast container.
 * @param {string} message - the message to display 
 * @param {string} type - bootstrap colourign for the type of container
 */
function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container');
    const existingToast = document.querySelector('.toast.show');

    if (existingToast) {
        existingToast.classList.remove('show');
        setTimeout(() => existingToast.remove(), 500); // Ensure smooth transition before removing
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';

    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    toastBody.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
    `;

    toast.appendChild(toastBody);
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();

    toast.querySelector('.btn-close').addEventListener('click', function() {
        bsToast.hide();
    });

    setTimeout(() => toast.classList.add('show'), 10);
}

function showDeleteConfirmationToast() {
    const toastContainer = document.getElementById('toast-container');
    const existingToast = document.querySelector('.toast.show');
    if (existingToast) {
        existingToast.classList.remove('show');
        setTimeout(() => existingToast.remove(), 500);
    }

    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-warning border-0';
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';

    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    toastBody.innerHTML = `
        <div class="toast-body">
            Are you sure you want to delete this fact? This action cannot be undone.
            <button id="confirm-delete" class="btn btn-danger btn-sm me-2">Delete</button>
            <button id="cancel-delete" class="btn btn-secondary btn-sm">Cancel</button>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
    `;
    
    toast.appendChild(toastBody);
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 10000 });
    bsToast.show();

    document.getElementById('confirm-delete').addEventListener('click', async function() {
        const factId = document.getElementById('submission-form').getAttribute('data-fact-id');
        const response = await fetch(`/api/fact/${factId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok) {
            showToast('Fact deleted successfully', 'success');
            setTimeout(() => {
                window.location.href = '/admin'; 
            }, 1500); 
        } else {
            showToast('Error deleting fact: ' + result.error, 'danger');
        }
        bsToast.hide();
    });

    document.getElementById('cancel-delete').addEventListener('click', function() {
        bsToast.hide();
    });

    toast.querySelector('.btn-close').addEventListener('click', function() {
        bsToast.hide();
    });

    setTimeout(() => toast.classList.add('show'), 10);
}