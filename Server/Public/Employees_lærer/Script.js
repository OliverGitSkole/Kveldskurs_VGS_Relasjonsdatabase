

document.addEventListener("DOMContentLoaded", () => {
    Refresh();
});

function Refresh() {
    fetch('/getTableData', {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector("#table tbody");
        tbody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');

            Object.entries(row).forEach(([key, value]) => {
                const td = document.createElement('td');

                // Make editable for relevant fields
                if (["prøve1", "prøve2", "prøve3", "standpunkt", "timer_deltatt"].includes(key)) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = value ?? 'mangler data';
                    input.dataset.key = key;
                    td.appendChild(input);
                } else {
                    td.textContent = value;
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    })
    .catch(err => console.error('Feil ved henting av data:', err));
}

function Apply() {
    const rows = document.querySelectorAll('#table tbody tr');
    const changes = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const entry = {
            KursID: cells[0].textContent,
            Fag: cells[1].textContent,
            Lærer: cells[2].textContent,
            Elev: cells[3].textContent,
            prøve1: cells[4].querySelector('input')?.value || null,
            prøve2: cells[5].querySelector('input')?.value || null,
            prøve3: cells[6].querySelector('input')?.value || null,
            standpunkt: cells[7].querySelector('input')?.value || null,
            timer_deltatt: cells[8].querySelector('input')?.value || null
        };
        changes.push(entry);
    });

    fetch('/applyChanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
    })
    .then(res => {
        if (res.ok) {
            alert("Endringer lagret!");
        } else {
            alert("Noe gikk galt ved lagring.");
        }
    })
    .catch(err => console.error('Feil ved lagring:', err));
}

