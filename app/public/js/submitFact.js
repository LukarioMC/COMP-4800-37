
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

/**
 * Creates an attachment file input and adds a remove button for already-filled file inputs.
 */
function createAttachmentInput() {
    let attachmentsDiv = document.getElementById('attachments')
    let attachments = Array.from(attachmentsDiv.children)

    attachments = attachments.filter((att) => {
        return att.tagName === 'INPUT'
    })

    attachments.forEach((att) => {
        if (att.files.length > 0 && !att.hasButton) {
            let btn = document.createElement('button')
            btn.className = 'btn btn-danger'
            btn.innerHTML = 'Remove'
            btn.onclick = () => {
                att.remove()
                btn.remove()
            }
            att.after(btn)
            att.hasButton = true
        }
    })

    if (!attachments.find((att) => att.files.length === 0)){
        let input = document.createElement('input')
        input.type = 'file'
        input.className = 'form-control'
        input.name = 'attachment'
        input.accept = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif', '.mp3', '.mpeg'].join(',')
        input.onchange = () => {
            if (input.files.length > 0) {
                if (input.files[0].size > 5 * Math.pow(1024, 2)) {
                    input.value = ''
                    alert('File is too large.')
                } else {
                    createAttachmentInput()
                }  
            }       
        }
        attachmentsDiv.appendChild(input)
    }
}

function resetForm() {
    let form = document.getElementById('submission-form')
    form.reset()
    document.getElementById('tags').innerHTML = ''
    document.getElementById('attachments').innerHTML = ''
    createAttachmentInput()
}

/**
 * Configures page.
 */
function configPage() {
    let ddtags = document.getElementsByClassName('ddtag')
    for (let i = 0; i < ddtags.length; i++) {
        ddtags[i].onclick = () => createSearchTag(ddtags[i].id)
    }

    createAttachmentInput()

    let form = document.getElementById('submission-form')

    form.onsubmit = (e) => {
        e.preventDefault()
        let data = new FormData(form)
        fetch(`/api/fact`, {
            method: 'post',
            body: data
        })
        .then((res) => {
            if (res.status === 201) resetForm()
            return res.json()
        })
        .then((result) => alert(result.message))
        .catch((err) => {
            if (err instanceof TypeError) {
                alert('Failure to upload attachment. Ensure that all attachments are of valid type and size.')
            }
        })
    }
}

configPage()