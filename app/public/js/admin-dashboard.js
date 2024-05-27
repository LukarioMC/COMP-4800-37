document.addEventListener('DOMContentLoaded', function() {
    // Add onclick event handlers to buttons
    configurePendingFactEvents();
    configureReportEvents();
    configDeleteTagBtns()
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
        btn.onclick = () => {
            fetch(`api/tag/${btn.getAttribute('data-id')}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (!res.ok) throw new Error('Request failed.')
                return res
            })
            .then(res => res.json())
            .then(res => {
                alert(`Successfully deleted ${btn.getAttribute('tagName')} tag.`)
                deleteTagHTML(btn.getAttribute('data-id'))
            })
            .catch(err =>
                alert(`Failed to delete ${btn.getAttribute('tagName')} tag.`)
            )
        }
    })
}

/**
 * Deletes the HTML node for the given tag category.
 * @param {Integer} tagID The ID of the tag.
 */
function deleteTagHTML(tagID) {
    const tags = Array.from(document.getElementsByClassName('tagRow'))
    const tagHTML = tags.find(tag => tag.getAttribute('tagID') == tagID)
    if (tagHTML) tagHTML.remove()
}
