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
                window.location.href = '/'; 
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

// function to handle toggling of tags
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