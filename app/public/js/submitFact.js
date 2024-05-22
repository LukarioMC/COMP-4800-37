

/**
 * Adds a tag name to the searchTags array and creates a corresponding HTML element.
 * @param {string} name Tag name.
 * @returns undefined
 */
function createSearchTag(name) {
    let form = document.getElementById('submission-form')

    let children = Array.from(form.children)

    if (children.find((child) => child.value === name)) return

    let tag = document.createElement('span')
    tag.className = "badge rounded-pill bg-primary"
    tag.id = name
    tag.innerHTML = name + `
    <button type="button" class="btn-close" aria-label="Close"></button>
    `
    document.getElementById('tags').appendChild(tag)

    let input = document.createElement('input')
    input.name = 'tag'
    input.type = 'hidden'
    input.value = name
    tag.appendChild(input)

    tag.onclick = () => {
        tag.remove()
        input.remove()
    }
}

function configPage() {
    let ddtags = document.getElementsByClassName('ddtag')
    for (let i = 0; i < ddtags.length; i++) {
        ddtags[i].onclick = () => createSearchTag(ddtags[i].id)
    }
}

configPage()