document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('dashboard').addEventListener('click', async function(event) {
        const target = event.target;
        if (target.classList.contains('action-btn')) {
            const factID = target.closest('.row').dataset.id;
            const action = target.dataset.action;

            if (action === 'approve') {
                await approveFact(factID);
            } else if (action === 'delete') {
                await deleteFact(factID);
            } else if (action === 'edit') {
                editFact(factID);
            }
        }
    });
});

async function deleteFact(factID) {
    const confirmation = confirm('Are you sure you want to delete this fact? This action cannot be undone.');
    if (confirmation) {
        const response = await fetch(`/api/fact/${factID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('Fact deleted successfully');
            window.location.reload();
        } else {
            alert('Error deleting fact: ' + result.message);
        }
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
