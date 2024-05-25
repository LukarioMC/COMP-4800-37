document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('reportsDashboard').addEventListener('click', async function(event) {
        const target = event.target;
        if (target.classList.contains('resolve-btn')) {
            const reportID = target.name;
            deleteReport(reportID, target);
        }
    }) 
})

/**
 * 
 * @param {number} reportID The ID of the report 
 */
async function deleteReport(reportID, target) {
    const response = await fetch(`/api/report/${reportID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() =>
        window.location.reload()
    )  
}