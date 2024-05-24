// Initializes a Set to track selected tags
const selectedTags = new Set();

document.addEventListener('DOMContentLoaded', function() {
    // if a tag is selected, then add it to the selectedTags Set
    document.querySelectorAll('.tag-selectable').forEach(tagElement => {
        if (tagElement.classList.contains('bg-primary')) {
            selectedTags.add(tagElement.getAttribute('data-tag'));
        }
    });
})