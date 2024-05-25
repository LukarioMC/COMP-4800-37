document.addEventListener('DOMContentLoaded', function() {
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
});

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
