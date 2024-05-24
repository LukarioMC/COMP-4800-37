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
 
        });
})

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