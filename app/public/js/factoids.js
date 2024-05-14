const searchTags = []

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
        document.getElementById('tags').removeChild(tag)
    }
}

function search() {
    let url = "/facts?"
    console.log(searchTags)
    searchTags.forEach(tagname => {
        url = url.concat(`tag=${tagname}`)
    });
    window.location.href = url
}

let ddtags = document.getElementsByClassName('ddtag')
for (let i = 0; i < ddtags.length; i++) {
    ddtags[i].onclick = () => createSearchTag(ddtags[i].id)
}

document.getElementById('search-by-text-btn').onclick = () => search()