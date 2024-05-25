let typingTimer;                
const doneTypingInterval = 1000;  
const countryMenu = document.getElementById('country')
const attIDs = [];

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

function doneTyping (e) {
    if (e.target !== '' && e.target.type === 'text') createAttachmentInput()
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
        if (((att.type === 'file' && att.files.length > 0) || (att.type === 'text' && att.value !== '')) &&
            !document.getElementById(`${att.id}-remove`)) {
            let btn = document.createElement('button')
            btn.className = 'btn btn-danger'
            btn.innerHTML = 'Remove'
            btn.id = `${att.id}-remove`
            let toggle = document.getElementById(`${att.id}-toggle`)
            btn.onclick = () => {
                att.remove()
                btn.remove()
                if (toggle) toggle.remove()
            }
            att.after(btn)
        }
    })

    const hasEmptyAttachment = attachments.find((att) => {
        return (att.type === 'file' && att.files.length === 0) ||
        (att.type === 'text' && att.value === '')
    })
    
    if (!hasEmptyAttachment){
        let input = document.createElement('input')
        input.type = 'file'
        input.className = 'form-control'
        input.name = 'attachment'
        let ptnAttID;
        do {
            ptnAttID = Math.random()
        } while (attIDs.includes(ptnAttID))
        attIDs.push(ptnAttID) 
        input.id = ptnAttID
        input.accept = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif', '.mp3', '.mpeg'].join(',')
        input.onchange = () => {
            if (input.type === 'file' && input.files.length > 0) {
                if (input.files[0].size > 5 * Math.pow(1024, 2)) {
                    input.value = ''
                    alert('File is too large.')
                } else {
                    createAttachmentInput()
                }  
            }       
        }
        input.addEventListener('keyup', function (e) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => doneTyping(e), doneTypingInterval);
        });
        
        input.addEventListener('keydown', function () {
            clearTimeout(typingTimer);
        });
        attachmentsDiv.appendChild(input)

        let btn = document.createElement('button')
        btn.className = 'btn btn-secondary'
        btn.textContent = 'Toggle to Link'
        btn.id = `${input.id}-toggle`
        btn.type = 'button'
        btn.onclick = () => {
            input.value = ''
            input.type = input.type === 'file' ? 'text' : 'file'
            btn.textContent = input.type === 'file' ? 'Toggle to Link' : 'Toggle to File'
            
            
        }
        attachmentsDiv.appendChild(btn)
    }
}

/**
 * Resets submission form.
 */
function resetForm() {
    let form = document.getElementById('submission-form')
    let i = countryMenu?.selectedIndex || 0
    
    form.reset()
    document.getElementById('tags').innerHTML = ''
    document.getElementById('attachments').innerHTML = ''
    createAttachmentInput()

    setCountry(i)
}

/**
 * Sets user's country selection based on their IP.
 * @param {Integer} i The index of the selected country, optional.
 * @returns undefined
 */
function setCountry(i = 0) {
    if (i !== 0) { 
        countryMenu.selectedIndex = i
        return
    }

    fetch('https://get.geojs.io/v1/ip/country.json')
    .then(res => res.json())
    .then((countryData) => {
        let i = Array.from(countryMenu.children).findIndex(opt => opt.value === countryData.country)
        if (i > -1) countryMenu.selectedIndex = i
    })
}

/**
 * Configures page.
 */
function configPage() {
    let dropdownTags = document.getElementsByClassName('37-dropdown-tag')
    for (let i = 0; i < dropdownTags.length; i++) {
        dropdownTags[i].onclick = () => createSearchTag(dropdownTags[i].id)
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
    // Uncomment the following line to automatically select country from the dropdown on page load
    // setCountry()
}

configPage()