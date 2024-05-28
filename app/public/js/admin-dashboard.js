document.addEventListener('DOMContentLoaded', function() {
    // Add onclick event handlers to buttons
    configurePendingFactEvents();
    configureReportEvents();
    configDeleteTagBtns();
    configEditTagBtns();
});

/**
 * Configures the page by adding event listeners to buttons in the dashboard for
 * pending facts.
 */
function configurePendingFactEvents() {
    document.getElementById('dashboard').addEventListener('click', async function(event) {
        const target = event.target;
        if (target.classList.contains('action-btn')) {
            const factID = target.closest('.row').dataset.id;
            const action = target.dataset.action;

            if (action === 'approve') {
                await approveFact(factID);
            } else if (action === 'edit') {
                editFact(factID);
            }
        }
    });
}

/**
 * Configures the page by adding event listeners to the resolve buttons on each
 * report.
 */
function configureReportEvents() {
    const resolveBtns = document.querySelectorAll('.resolve-btn');
    for (btn of resolveBtns) {
        btn.addEventListener('click', (event) => {
            const target = event.target;
            if (!target) return;
            const reportID = target.dataset.report;
            const reportElem = document.getElementById(`report-${reportID}`);
            deleteReport(reportID, reportElem);
        }) 
    }
}

async function approveFact(factID) {
    const response = await fetch(`/api/approve/${factID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    if (response.ok) {
        alert('Fact approved successfully');
        window.location.reload(); 
    } else {
        alert('Error approving fact: ' + result.message);
    }
}

function editFact(factID) {
    window.location.href = `/edit-fact/${factID}`;
}

/**
 * A fetch request to the delete route for /api/report/:reportID
 * @param {number} reportID The ID of the report 
 */
async function deleteReport(reportID, reportElement) {
    await fetch(`/api/report/${reportID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (reportElement instanceof Element) reportElement.remove();
}

/**
 * Configures all tag category delete buttons to call the tag delete API and deletes the HTML node on success.
 */
function configDeleteTagBtns() {
    const deleteBtns = Array.from(document.getElementsByClassName('deleteTagButton'))
    deleteBtns.forEach((btn) => {
        const tagHTML = document.querySelector(`.tagRow[tagID="${btn.getAttribute('data-id')}"]`)

        btn.onclick = () => {
            const name = tagHTML.getAttribute('myTagName')
            fetch(`api/tag/${btn.getAttribute('data-id')}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (!res.ok) throw new Error('Request failed.')
                return res
            })
            .then(res => res.json())
            .then(res => {
                alert(`Successfully deleted ${name} tag.`)
                tagHTML.remove()
            })
            .catch(err =>
                alert(`Failed to delete ${name} tag.`)
            )
        }
    })
}

/**
 * Configures all tag category delete buttons to call the tag delete API and deletes the HTML node on success.
 */
function configEditTagBtns() {
    const editBtns = Array.from(document.getElementsByClassName('editTagButton'))
    editBtns.forEach((btn) => { btn.onclick = () => enableTagEditing(btn.getAttribute('data-id')) })
}

function enableTagEditing(tagID) {
    const tagHTML = document.querySelector(`.tagRow[tagID="${tagID}"]`)
    const tagNameHTML = tagHTML.querySelector('.tagName')
    const editBtn = tagHTML.querySelector('.editTagButton')
    const currentName = tagHTML.getAttribute('myTagName')
    const currentlyPrimary = tagHTML.querySelector('.form-check-input').checked

    let newNameField = document.createElement('input')
    newNameField.type = 'text'
    newNameField.value = currentName
    newNameField.classList.add('newTagNameField', 'form-control')
    newNameField.width = '100%'

    tagHTML.querySelector('.form-check-input').disabled = false

    tagNameHTML.innerHTML = ""
    tagNameHTML.appendChild(newNameField)

    editBtn.innerHTML = 'Save'
    editBtn.onclick = () => submitTagUpdate(tagID, currentName, currentlyPrimary)
}

function submitTagUpdate(tagID, oldName, wasPrimary) {
    const tagHTML = document.querySelector(`.tagRow[tagID="${tagID}"]`)
    const newName = tagHTML.querySelector(`.newTagNameField`).value
    const editBtn = tagHTML.querySelector('.editTagButton')
    const isPrimaryCheckbox = tagHTML.querySelector('.form-check-input')
    
    if (oldName === newName.trim() && wasPrimary === isPrimaryCheckbox.checked) {
        tagHTML.querySelector('.tagName').innerHTML = oldName
        editBtn.onclick = () => enableTagEditing(tagID)
        editBtn.innerHTML = 'Edit'
        isPrimaryCheckbox.checked = wasPrimary
        console.log(wasPrimary)
        isPrimaryCheckbox.disabled = true
        return
    }
    fetch(`/api/tag/${tagID}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newName,
            isPrimary: isPrimaryCheckbox.checked
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('Request failed.')
        return res.json()
    })
    .then(res => {
        let nameChange = oldName !== newName.trim() ? `\n- Changed category name from ${oldName} to ${newName}` : ''
        let isPrimaryChange = isPrimaryCheckbox.checked !== wasPrimary ? `\n- Changed isPrimary status to ${isPrimaryCheckbox.checked}` : ''
        let allChanges = `The following changes occured:` + nameChange + isPrimaryChange
        alert(allChanges)
        tagHTML.querySelector('.tagName').innerHTML = newName
        tagHTML.setAttribute('myTagName', newName)
    })
    .catch((err) => {
        alert(err.message)
        tagHTML.querySelector('.tagName').innerHTML = oldName
        tagHTML.setAttribute('myTagName', oldName)
        isPrimaryCheckbox.checked = wasPrimary
    })
    .finally((data) => {
        editBtn.onclick = () => enableTagEditing(tagID)
        editBtn.innerHTML = 'Edit'
        isPrimaryCheckbox.disabled = true
    })
}