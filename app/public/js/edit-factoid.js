// Initializes a Set to track selected tags
const selectedTags = new Set();

document.addEventListener('DOMContentLoaded', function() {
    // if a tag is selected, then add it to the selectedTags Set
    document.querySelectorAll('.tag-selectable').forEach(tagElement => {
        if (tagElement.classList.contains('bg-primary')) {
            selectedTags.add(tagElement.getAttribute('data-tag'));
        }
    });

    // add event listener to each tag
    document.querySelectorAll('.tag-selectable').forEach(tagElement => {
        tagElement.addEventListener('click', () => toggleTagSelection(tagElement));
    });

    // add event listener for form submission
    document.getElementById('submission-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        // Convert selectedTags Set to an array and add to form data
        formData.append('tags', JSON.stringify(Array.from(selectedTags)));

        const data = Object.fromEntries(formData.entries());
        data.tags = JSON.parse(data.tags);

        const factId = form.getAttribute('data-fact-id');

        const response = await fetch(`/api/fact/${factId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Fact updated successfully');
        } else {
            alert('Error updating fact: ' + result.error);
        }
    });

    // adds event listener for delete button on click
    document.getElementById('delete-button').addEventListener('click', async function() {
        const confirmation = confirm('Are you sure you want to delete this fact? This action cannot be undone.');
        if (confirmation) {
            const factId = document.getElementById('submission-form').getAttribute('data-fact-id');
            const response = await fetch(`/api/fact/${factId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (response.ok) {
                alert('Fact deleted successfully');
                window.location.href = '/admin'; 
            } else {
                alert('Error deleting fact: ' + result.error);
            }
        }
    });

    // adds event for deleting an attachment
    document.getElementById('attachments-container').addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-delete-attachment')) {
            const attachmentId = event.target.getAttribute('data-attachment-id');
            deleteAttachment(attachmentId);
        }
    });
});

/**
 * Toggles the selection of a tag element. If the tag is selected, it will be deselected, and vice versa.
 * Updates the appearance of the tag element to reflect its selection state.
 * @param {HTMLElement} tagElement - The tag element to toggle.
 */
function toggleTagSelection(tagElement) {
    const tagName = tagElement.getAttribute('data-tag');

    if (selectedTags.has(tagName)) {
        selectedTags.delete(tagName);
        tagElement.classList.remove('bg-primary');
        tagElement.classList.add('bg-secondary');
    } else {
        selectedTags.add(tagName);
        tagElement.classList.remove('bg-secondary');
        tagElement.classList.add('bg-primary');
    }
}

/**
 * Deletes the attachment with the specified attachment ID from the server.
 * @param {number} attachmentId - The ID of the attachment to delete.
 */
function deleteAttachment(attachmentId) {
    fetch(`/api/attachment/${attachmentId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(() => {
        console.log('Attachment deleted successfully');
        refreshAttachments();
    })
    .catch(error => {
        console.error('Error deleting attachment', error);
        alert('Error deleting attachment');
    });
}

/**
 * Fetches the updated list of attachments for the current factoid and refreshes the attachments container.
 */
function refreshAttachments() {
    const factId = document.getElementById('submission-form').getAttribute('data-fact-id');
    fetch(`/api/fact/${factId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch attachments');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched attachments:', data);
            const attachmentsContainer = document.getElementById('attachments-container');
            attachmentsContainer.innerHTML = '';

            const order = ['image', 'youtube', 'audio', 'website'];
            const sortedAttachments = data.attachments.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

            sortedAttachments.forEach(att => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.classList.add('attachment');
                let content = '';
                switch (att.type) {
                    case 'image':
                        content = `<img src="/uploads/${att.link}" style="width: 50%; height: 50%"><button type="button" class="btn-delete-attachment" data-attachment-id="${att.id}">&times;</button>`;
                        break;
                    case 'audio':
                        content = `<audio controls><source src="/uploads/${att.link}"></audio><button type="button" class="btn-delete-attachment" data-attachment-id="${att.id}">&times;</button>`;
                        break;
                    case 'youtube':
                        const embedLink = att.link.replace('watch?v=', 'embed/');
                        content = `<iframe width="50%" height="50%" src="${embedLink}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><button type="button" class="btn-delete-attachment" data-attachment-id="${att.id}">&times;</button>`;
                        break;
                    case 'website':
                        content = `<a href="${att.link}" style="display: block">Learn More</a><button type="button" class="btn-delete-attachment" data-attachment-id="${att.id}">&times;</button>`;
                        break;
                }
                attachmentDiv.innerHTML = content;
                attachmentsContainer.appendChild(attachmentDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching attachments', error);
            alert('Error fetching attachments');
        });
}

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