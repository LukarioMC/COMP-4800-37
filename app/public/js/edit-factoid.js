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