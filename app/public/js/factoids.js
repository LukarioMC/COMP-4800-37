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
    tag.className = "badge rounded-pill bg-primary me-2"
    tag.id = name
    tag.innerHTML = name + `
    <button type="button" class="btn-close btn-close-white" aria-label="Remove Tag"></button>
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
    let dropdowntags = document.getElementsByClassName('37-dropdown-tag')
    for (let i = 0; i < dropdowntags.length; i++) {
        dropdowntags[i].onclick = () => createSearchTag(dropdowntags[i].id)
    }

    if (activeTagsString) {
        activeTagsJS = activeTagsString.split(',')
        activeTagsJS.forEach((tagname) => createSearchTag(tagname))
    }
    
    document.getElementById('search-by-text-btn').onclick = () => search()
    document.getElementById('search-form').onsubmit = (e) => {
        e.preventDefault();
        search();
    }

    configPagination()
}

/**
 * Configures the page naviation buttons.
 */
function configPagination() {
    let pagesMenu = document.getElementById('pages');
    let next = document.getElementById('next');
    let prev = document.getElementById('prev');
    let displayedPages = 5;
    try {
        current = parseInt(current);
        let currentPage = current - Math.floor(displayedPages / 2);
        if (currentPage < 1) currentPage = 1;
        let url = new URL(window.location.href);
        while(displayedPages > 0 && currentPage < maxPages) {
            url.searchParams.set('pageNum', currentPage)
            pagesMenu.insertBefore(createPageButton(currentPage, url.toString()), next)
            displayedPages--;
            currentPage++;
        }
        // Set prev, next
        if (current > 1) {
            url.searchParams.set('pageNum', current - 1);
            prev.children[0].href = url.toString();
        }
        if (current + 1 <= maxPages) {
            url.searchParams.set('pageNum', current + 1);
            next.children[0].href = url.toString();
        }
    } catch (e) {
        console.log(e)
    }  
}

/**
 * Creates a page navigation button.
 * @param {number} n The page number. 
 * @param {string} url URL string of the page link.
 * @returns The created page navigation button.
 */
function createPageButton(n, url) {
    let pageBtn = document.createElement('li');
    pageBtn.className = 'page-item';
    let pageBtnLink = document.createElement('a');
    pageBtnLink.className = 'page-link';
    pageBtnLink.innerHTML = n;
    pageBtnLink.href = url;
    pageBtn.appendChild(pageBtnLink);
    return pageBtn;
}

configPage();
