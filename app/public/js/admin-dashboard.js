document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('dashboard').addEventListener('click', async function(event) {
        const target = event.target;
        if (target.classList.contains('action-btn')) {
            const action = target.dataset.action;

            if (action === 'approve') {
                await approveFact();
            } else if (action === 'delete') {
                await deleteFact();
            } else if (action === 'edit') {
                editFact();
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
