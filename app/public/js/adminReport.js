document.addEventListener('DOMContentLoaded', function() {
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
})

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