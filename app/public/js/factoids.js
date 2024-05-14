const searchTags = []

/**
 * Adds a tag name to the searchTags array and creates a corresponding HTML element.
 * @param {string} name Tag name.
 * @returns undefined
 */
function createSearchTag(name) {
    if (searchTags.indexOf(name) > -1) return

    searchTags.push(name)
    let tag = document.createElement('span')
    tag.className = "badge rounded-pill bg-primary"
    tag.id = name
    tag.innerHTML = name + `
    <button type="button" class="btn-close" aria-label="Close"></button>
    `
    document.getElementById('tags').appendChild(tag)
    tag.onclick = () => {
        let i = searchTags.indexOf(tag.id)
        if (i > -1) searchTags.splice(i, 1)
        tag.remove()
    }
}

/**
 * Reads tags and search text to redirect client to a queried /fact page.
 */
function search() {
    let url = "/facts?"
    searchTags.forEach(tagname => {
        url = url.concat(`&tag=${tagname}`)
    });
    
    let searchText = document.getElementById('searchBarText').value
    if (searchText !== '') {
        url = url.concat(`&searchText=${searchText}`)
    }

    window.location.href = url
}

/**
 * Configures /fact by adding onclick functionality to dropdown menu items, the search button and by creating HTML elements for tags already in use.
 */
function configPage() {
    let ddtags = document.getElementsByClassName('ddtag')
    for (let i = 0; i < ddtags.length; i++) {
        ddtags[i].onclick = () => createSearchTag(ddtags[i].id)
    }

    if (activeTagsString) {
        activeTagsJS = activeTagsString.split(',')
        activeTagsJS.forEach((tagname) => createSearchTag(tagname))
    }
    
    document.getElementById('search-by-text-btn').onclick = () => search()
}

configPage()
