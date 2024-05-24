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
}

async function approveFact(factID) {
}

function editFact(factID) {
}
