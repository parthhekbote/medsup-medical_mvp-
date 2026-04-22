// This file contains the corrected renderCommandStrip and renderInventory functions
// Copy these to replace the existing functions in app.js

/* Area 1: Command Summary Strip - CORRECTED VERSION */
function renderCommandStrip(data) {
    const strip = document.getElementById('commandStrip');

    // Calculate metrics
    const emergency = data.filter(i => {
        const daysLeft = i.quantity / (i.details.avg_usage || 1);
        return daysLeft < 2;
    }).length;

    const critical = data.filter(i => {
        const daysLeft = i.quantity / (i.details.avg_usage || 1);
        return daysLeft >= 2 && daysLeft < 5;
    }).length;

    // Estimate value at risk (mock calculation)
    const valueAtRisk = data
        .filter(i => (i.quantity / (i.details.avg_usage || 1)) < 5)
        .reduce((sum, i) => sum + (i.quantity * 50), 0); // $50 avg unit cost

    strip.innerHTML = `
        <div class="cmd-metric" onclick="filterInventory('EMERGENCY')">
            <span class="cmd-label">🚨 Emergency</span>
            <span class="cmd-value critical">${emergency}</span>
        </div>
        <div class="cmd-metric" onclick="filterInventory('CRITICAL')">
            <span class="cmd-label">⚠️ Critical (48h)</span>
            <span class="cmd-value warning">${critical}</span>
        </div>
        <div class="cmd-metric">
            <span class="cmd-label">💰 Value at Risk</span>
            <span class="cmd-value money">$${valueAtRisk.toLocaleString()}</span>
        </div>
    `;
}

// CORRECTED renderInventory - 5 columns matching headers
function renderInventory(data) {
    allInventory = data; // Cache it
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    data.forEach(item => {
        //Calculate Days Left
        const avgUse = item.details.avg_usage || 1;
        const daysLeft = (item.quantity / avgUse).toFixed(1);

        // Determine Status Class
        let rowClass = '';
        if (daysLeft < 1) rowClass = 'row-critical';
        else if (daysLeft < 3) rowClass = 'row-low';

        // Area 2: Determine Failure Mode
        let failureMode = '';
        let failureClass = '';
        if (daysLeft < 2) {
            failureMode = `Stockout < ${Math.ceil(daysLeft * 24)}h`;
            failureClass = 'stockout';
        } else if (daysLeft < 5) {
            failureMode = 'Critical depletion';
            failureClass = 'expiring';
        } else if (item.risk_level === 'WARNING') {
            failureMode = 'Demand spike';
            failureClass = 'demand';
        } else {
            failureMode = 'Normal';
            failureClass = '';
        }

        // Area 4: Time-to-Failure Indicator
        const ttfPercent = Math.min(100, (daysLeft / 7) * 100); // 7 days = 100%
        let ttfClass = '';
        if (daysLeft < 2) ttfClass = 'critical';
        else if (daysLeft < 5) ttfClass = 'warning';

        const row = document.createElement('tr');
        row.className = rowClass;
        row.onclick = () => showContextPanel(item, daysLeft);

        row.innerHTML = `
            <td class="cell-name">${item.name}</td>
            <td class="cell-stock">${item.quantity} <span class="cell-sub">units</span></td>
            <td class="cell-sub">${avgUse}/day</td>
            <td>
                <div class="ttf-container">
                    <div class="ttf-bar">
                        <div class="ttf-fill ${ttfClass}" style="width: ${ttfPercent}%"></div>
                    </div>
                    <span>${daysLeft}d</span>
                </div>
            </td>
            <td>
                <span class="fail-mode ${failureClass}">${failureMode}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}
