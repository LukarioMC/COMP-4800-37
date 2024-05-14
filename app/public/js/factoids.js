/**
 * Script to configure the fact list and search HTML elements.
 */

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

    configPagination()
}

/**
 * Configures the page naviation buttons.
 */
function configPagination() {
    let pagesMenu = document.getElementById('pages')
    let next = document.getElementById('next')
    let prev = document.getElementById('prev')
    let pages = []

    try {
        current = parseInt(current)
        if (current > 1) {
            pagesMenu.insertBefore(createPageButton(current - 1), next)
            let url = new URL(window.location.href)
            url.searchParams.set('pageNum', current - 1)
            prev.children[0].href = url.toString()
        }
        pagesMenu.insertBefore(createPageButton(current), next)
        if (current + 1 <= maxPages) {
            pagesMenu.insertBefore(createPageButton(current + 1), next)
            let url = new URL(window.location.href)
            url.searchParams.set('pageNum', current + 1)
            next.children[0].href = url.toString()
        }
    } catch (e) {
        console.log(e)
    }  
}

/**
 * Creates a page navigation button.
 * @param {number} n The page number. 
 * @returns The page navigation button.
 */
function createPageButton(n) {
    let pageBtn = document.createElement('li')
    pageBtn.className = 'page-item'
    let pageBtnLink = document.createElement('a')
    pageBtnLink.className = 'page-link'
    pageBtnLink.innerHTML = n
    let url = new URL(window.location.href)
    url.searchParams.set('pageNum', n)
    pageBtnLink.href = url.toString()

    pageBtn.appendChild(pageBtnLink)
    return pageBtn
}

configPage()
