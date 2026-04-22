const API_URL = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    loadInventory();
    loadAuditLogs();
    loadAccounting();

    document.getElementById('refreshBtn').addEventListener('click', loadInventory);
});

/* Menu and Mode Switching Logic */
function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const menuToggle = document.getElementById('menuToggle');
    const appMenu = document.getElementById('appMenu');

    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.getAttribute('data-mode');
            switchMode(mode);

            // Update active state
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Handle menu toggle
    menuToggle.addEventListener('click', () => {
        appMenu.classList.toggle('collapsed');
    });
}

function switchMode(modeName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show selected view
    const viewMap = {
        'ops-command': 'opsCommandView',
        'inventory-intel': 'inventoryIntelView',
        'procurement': 'procurementView',
        'finance': 'financeView',
        'audit': 'auditView',
        'settings': 'settingsView'
    };

    const viewId = viewMap[modeName];
    if (viewId) {
        document.getElementById(viewId).classList.add('active');
    }
}

/* --- Inventory & Orders --- */

async function loadInventory() {
    try {
        const res = await fetch(`${API_URL}/inventory/status`);
        const data = await res.json();
        renderCommandStrip(data); // Area 1
        renderInventory(data);
        generateRecommendations(data);
    } catch (err) {
        console.error("Failed to load inventory", err);
    }
}

/* Global Inventory Data Cache for Filtering */
let allInventory = [];

/* Decision-Driven Risk Calculation */
function calculateRiskSignal(daysLeft) {
    if (daysLeft < 7) return { level: 'CRITICAL', icon: '<span class="risk-dot dot-CRITICAL"></span>', class: 'risk-critical' };
    if (daysLeft < 14) return { level: 'WARNING', icon: '<span class="risk-dot dot-WARNING"></span>', class: 'risk-warning' };
    return { level: 'STABLE', icon: '<span class="risk-dot dot-SAFE"></span>', class: 'risk-stable' };
}

function getActionRecommendation(item, daysLeft) {
    // Urgent - Emergency action required
    if (daysLeft < 2) {
        return `🚨 URGENT: Emergency reorder + transfer`;
    }

    // Critical - Immediate reorder
    if (daysLeft < 7) {
        const qty = Math.ceil((item.details.avg_usage || 1) * 14); // 2 weeks worth
        return `Reorder ${qty} units (Lead: 3 days)`;
    }

    // Warning - Schedule reorder
    if (daysLeft < 14) {
        return `Schedule reorder soon (7-10 days buffer)`;
    }

    // Stable - Monitor
    return `Monitor usage trends`;
}

/* Area 1: Enhanced Command Summary Strip with Priority Queue */
function renderCommandStrip(data) {
    const strip = document.getElementById('commandStrip');

    // Get priority items (critical and high-warning)
    const priorityItems = data
        .map(item => {
            const daysLeft = item.quantity / (item.details.avg_usage || 1);
            const risk = calculateRiskSignal(daysLeft);
            const action = getActionRecommendation(item, daysLeft);
            return { ...item, daysLeft, risk, action };
        })
        .filter(item => item.risk.level !== 'STABLE')
        .sort((a, b) => {
            // Sort by risk level, then days left
            if (a.risk.level === 'CRITICAL' && b.risk.level !== 'CRITICAL') return -1;
            if (a.risk.level !== 'CRITICAL' && b.risk.level === 'CRITICAL') return 1;
            return a.daysLeft - b.daysLeft;
        })
        .slice(0, 5); // Max 5 items

    const emergency = data.filter(i => (i.quantity / (i.details.avg_usage || 1)) < 2).length;
    const critical = data.filter(i => {
        const d = i.quantity / (i.details.avg_usage || 1);
        return d >= 2 && d < 7;
    }).length;

    let priorityHTML = '';
    if (priorityItems.length > 0) {
        priorityHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; overflow-x: auto; flex: 1; margin-left: 0.5rem; padding-bottom: 4px;">
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; white-space: nowrap; font-weight: 600;">
                    <span class="risk-dot dot-WARNING"></span> Action Required
                </div>
                <div style="display: flex; gap: 0.75rem;">
                ${priorityItems.map(item => {
                    const bColor = item.risk.class === 'risk-critical' ? 'var(--danger)' : 'var(--warning)';
                    const bgClass = item.risk.class === 'risk-critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                    return `
                    <div style="background: ${bgClass}; border: 1px solid ${bColor}; border-radius: 6px; padding: 0.4rem 0.75rem; cursor: pointer; white-space: nowrap; transition: all 0.2s;" onclick="highlightTableRow(${item.id || item.supply_id})" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='${bgClass}'">
                        <div style="font-size: 0.8rem; font-weight: 600; color: white; display: flex; align-items: center; gap: 0.5rem;">
                            ${item.name}
                            <span style="font-size: 0.65rem; color: ${bColor}; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 10px; font-weight: bold;">${item.daysLeft.toFixed(1)}d left</span>
                        </div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.2rem;">${item.action}</div>
                    </div>
                `}).join('')}
                </div>
            </div>
        `;
    }

    strip.innerHTML = `
        <div style="display: flex; gap: 1.5rem; align-items: center; border-right: 1px solid var(--border); padding-right: 1.5rem; min-width: max-content;">
            <div class="cmd-metric" onclick="filterInventory('EMERGENCY')" style="border: none; padding: 0;">
                <span class="cmd-label"><span class="risk-dot dot-EMERGENCY"></span> Emergency</span>
                <span class="cmd-value critical">${emergency}</span>
            </div>
            <div class="cmd-metric" onclick="filterInventory('CRITICAL')" style="border: none; padding: 0;">
                <span class="cmd-label"><span class="risk-dot dot-CRITICAL"></span> Critical (< 7d)</span>
                <span class="cmd-value warning">${critical}</span>
            </div>
        </div>
        ${priorityHTML}
    `;
}

function highlightTableRow(itemId) {
    // Remove previous highlights
    document.querySelectorAll('tr.highlighted').forEach(row => row.classList.remove('highlighted'));

    // Highlight the row
    const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
    if (row) {
        row.classList.add('highlighted');
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function renderInventory(data) {
    allInventory = data; // Cache it
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    data.forEach(item => {
        // Calculate Days Left
        const avgUse = item.details.avg_usage || 1;
        const daysLeft = (item.quantity / avgUse).toFixed(1);

        // Calculate risk signal
        const risk = calculateRiskSignal(parseFloat(daysLeft));

        // Get action recommendation
        const action = getActionRecommendation(item, parseFloat(daysLeft));

        // Determine row class for highlighting
        let rowClass = '';
        if (daysLeft < 7) rowClass = 'row-critical';
        else if (daysLeft < 14) rowClass = 'row-warning';

        const row = document.createElement('tr');
        row.className = rowClass;
        row.setAttribute('data-item-id', item.id || item.supply_id);
        row.onclick = () => showContextPanel(item, daysLeft);

        row.innerHTML = `
            <td class="cell-name">${item.name}</td>
            <td class="cell-stock">${item.quantity} <span class="cell-sub">units</span></td>
            <td class="cell-sub">${avgUse}/day</td>
            <td class="days-left ${daysLeft < 7 ? 'days-critical' : daysLeft < 14 ? 'days-warning' : ''}">
                <span class="days-number">${daysLeft}</span> days
            </td>
            <td>
                <span class="risk-signal ${risk.class}">${risk.icon} ${risk.level}</span>
            </td>
            <td class="action-recommendation">
                ${action}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showContextPanel(item, daysLeft) {
    const panel = document.getElementById('itemContextPanel');
    document.getElementById('ctxName').textContent = item.name;
    document.getElementById('ctxStock').textContent = item.quantity;
    document.getElementById('ctxDept').textContent = item.department;
    document.getElementById('ctxNote').textContent = `Stock covers ${daysLeft} days of usage based on current trends.`;

    panel.classList.add('active');
}

function closeContextPanel() {
    document.getElementById('itemContextPanel').classList.remove('active');
}

function filterInventory(status) {
    // Basic Client-Side Filter
    const filtered = allInventory.filter(i => {
        const daysLeft = i.quantity / (i.details.avg_usage || 1);
        if (status === 'EMERGENCY') return daysLeft < 2;
        if (status === 'CRITICAL') return i.risk_level === 'EMERGENCY' || i.stock_status === 'CRITICAL';
        if (status === 'LOW') return i.risk_level === 'WARNING' || i.stock_status === 'LOW';
        return true;
    });

    // Re-render
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    filtered.forEach(item => {
        const avgUse = item.details.avg_usage || 1;
        const daysLeft = (item.quantity / avgUse).toFixed(1);

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
        const ttfPercent = Math.min(100, (daysLeft / 7) * 100);
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

/* Action Panel Logic */

/* Action Panel Logic */

function generateRecommendations(data, filterType = null) {
    const container = document.getElementById('recommendationsList');
    container.innerHTML = '';

    // 1. Identify Actionable Items
    let actions = data.filter(i => i.stock_status !== 'HEALTHY').map(item => {
        const daysLeft = (item.quantity / (item.details.avg_usage || 1)).toFixed(1);

        // Area 3: Determine action type and context
        let actionType = 'RESTOCK';
        let actionLabel = `Approve Restock (ETA: 12h)`;
        let outcome = `Restocks ${item.name}, prevents stockout`;
        let consequence = `Possible stockout in ${daysLeft}d`;

        if (daysLeft < 1) {
            actionType = 'EMERGENCY';
            actionLabel = 'Emergency Reorder (ETA: 6h)';
            outcome = 'Fast-track delivery, prevents immediate failure';
            consequence = 'CRITICAL: Stockout imminent';
        } else if (item.department === 'ICU' && daysLeft < 3) {
            actionType = 'TRANSFER';
            actionLabel = 'Transfer from General Ward';
            outcome = 'Immediate stock boost from alternate location';
            consequence = `ICU stockout risk in ${daysLeft}d`;
        }

        return {
            type: actionType,
            priority: item.risk_level === 'EMERGENCY' ? 0 : 1,
            riskLabel: item.risk_level === 'EMERGENCY' ? 'CRITICAL' : 'WARNING',
            title: `${actionType === 'TRANSFER' ? 'Transfer' : 'Restock'} ${item.name}`,
            desc: `${item.stock_status} Stock (${item.quantity} units)`,
            meta: `Daily Use: ${item.details.avg_usage || 1} | Buffer: ${daysLeft} days`,
            actionLabel,
            outcome,
            consequence,
            item: item
        };
    });

    // 2. Sort by Priority
    actions.sort((a, b) => a.priority - b.priority);

    // 3. Apply Filter
    if (filterType === 'CRITICAL') {
        actions = actions.filter(a => a.riskLabel === 'CRITICAL');
    }

    if (actions.length === 0) {
        container.innerHTML = '<div class="text-muted" style="padding:1rem"><span class="risk-dot dot-HEALTHY"></span> No pending actions.</div>';
        return;
    }

    // 4. Render Enhanced Cards
    actions.forEach(act => {
        const card = document.createElement('div');
        card.className = `action-card card-${act.riskLabel}`;

        card.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            showContextPanel(act.item, (act.item.quantity / (act.item.details.avg_usage || 1)).toFixed(1));
        };

        card.innerHTML = `
            <div class="card-header">
                <span class="card-title">${act.title}</span>
                <span class="risk-dot dot-${act.riskLabel === 'CRITICAL' ? 'EMERGENCY' : 'WARNING'}"></span>
            </div>
            <div class="card-meta">${act.desc}</div>
            <div class="card-meta">${act.meta}</div>
            <div class="context-row">
                <span class="ctx-label">✓ Outcome:</span>
                <span class="ctx-val">${act.outcome}</span>
            </div>
            <div class="context-row">
                <span class="ctx-label">✗ If Ignored:</span>
                <span class="ctx-val" style="color: var(--warning)">${act.consequence}</span>
            </div>
            <div class="card-actions">
                <button class="btn-sm btn-approve" onclick="approveOrder(${act.item.supply_id}, 100, '${act.item.name}')">${act.actionLabel}</button>
                <button class="btn-sm btn-ignore" onclick="rejectOrder('${act.item.name}')">Ignore</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterActions(type) {
    // Re-render using the cached inventory data
    generateRecommendations(allInventory, type);
}

async function approveOrder(id, qty, name) {
    if (!hasPermission('approve_order')) {
        alert('[ACCESS DENIED]: You do not have permission to approve orders.\n\nThis action requires OPS_MANAGER role.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/orders/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supply_id: id, quantity: qty })
        });
        if (res.ok) {
            const order_data = await res.json();
            // Auto approve for demo flow
            await fetch(`${API_URL}/orders/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order_data.id, action: 'APPROVE' })
            });

            const user = getCurrentUser();
            addAuditLog('ORDER_APPROVED', `${user.name} (${user.role}) approved order for ${qty}x ${name}`);
            loadInventory(); // Refresh
        }
    } catch (err) {
        console.error(err);
    }
}

function rejectOrder(name) {
    if (!hasPermission('reject_order')) {
        alert('[ACCESS DENIED]: You do not have permission to reject orders.\n\nThis action requires OPS_MANAGER role.');
        return;
    }

    const user = getCurrentUser();
    addAuditLog('ORDER_REJECTED', `${user.name} (${user.role}) rejected restock for ${name}`);
}

/* Area 5: Audit Log with meaningful events highlighted */

function addAuditLog(action, details) {
    const tbody = document.querySelector('#auditTable tbody');
    const row = document.createElement('tr');
    const time = new Date().toLocaleTimeString();

    // Get the current user
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const userName = user ? user.name : 'System';

    // Determine if this is a high-priority operational event
    const isOperational = ['ORDER_APPROVED', 'ORDER_REJECTED', 'STOCK_TRANSFER', 'EMERGENCY_ORDER'].includes(action);
    const rowStyle = isOperational ? 'style="background: rgba(59, 130, 246, 0.05); border-left: 2px solid var(--accent);"' : '';
    const actionStyle = isOperational ? 'style="color: var(--accent); font-weight: 700;"' : '';

    row.innerHTML = `
        <td style="color: #64748b; font-size: 0.8rem;">${time}</td>
        <td><span style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: var(--text-main);">${userName}</span></td>
        <td ${actionStyle}><strong>${action}</strong></td>
        <td>${details}</td>
    `;
    row.setAttribute('style', rowStyle.replace('style="', '').replace('"', ''));
    tbody.prepend(row);
}

function loadAuditLogs() {
    // Only add system boot once, dimmed
    const tbody = document.querySelector('#auditTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td style="color: #64748b; font-size: 0.8rem;">${new Date().toLocaleTimeString()}</td>
        <td><span style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: var(--text-muted); opacity: 0.5;">System</span></td>
        <td style="opacity: 0.5;"><strong>SYSTEM_BOOT</strong></td>
        <td style="opacity: 0.5;">System initialized successfully.</td>
    `;
    tbody.appendChild(row);
}

/* --- Accounting Logic --- */

async function loadAccounting() {
    await Promise.all([loadCustomers(), loadSummary()]);
}

async function loadCustomers() {
    try {
        const res = await fetch(`${API_URL}/accounting/customers`);
        const customers = await res.json();

        const tbody = document.querySelector('#customerTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const select = document.getElementById('txnCustomer');
        if (select) select.innerHTML = '<option value="">Select Customer</option>';

        customers.forEach(c => {
            // Table
            tbody.innerHTML += `
                <tr>
                    <td>${c.name}</td>
                    <td>$${c.debit}</td>
                    <td>$${c.credit}</td>
                    <td style="color: ${c.balance > 0 ? 'var(--warning)' : 'var(--success)'}">$${c.balance}</td>
                </tr>
            `;

            // Dropdown
            if (select) select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    } catch (e) { console.error(e); }
}

async function loadSummary() {
    try {
        const res = await fetch(`${API_URL}/accounting/summary`);
        const data = await res.json();
        const profitEl = document.getElementById('totalProfit');
        const lossEl = document.getElementById('totalLoss');
        if (profitEl) profitEl.textContent = `$${data.total_profit}`;
        if (lossEl) lossEl.textContent = `$${data.total_loss}`;
    } catch (e) { console.error(e); }
}

async function addCustomer() {
    const name = document.getElementById('newCustName').value;
    if (!name) return;

    await fetch(`${API_URL}/accounting/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    document.getElementById('newCustName').value = '';
    loadAccounting();
}

function toggleTxnFields() {
    const type = document.getElementById('txnType').value;
    const cust = document.getElementById('txnCustomer');
    const amt = document.getElementById('txnAmount');
    const cost = document.getElementById('txnCost');

    if (type === 'WASTE') {
        cust.style.display = 'none';
        amt.style.display = 'none';
        cost.style.display = 'block';
        cost.placeholder = "Lost Value / Cost ($)";
    } else if (type === 'PAYMENT') {
        cust.style.display = 'block';
        amt.style.display = 'block';
        amt.placeholder = "Payment Amount ($)";
        cost.style.display = 'none';
    } else {
        cust.style.display = 'block';
        amt.style.display = 'block';
        amt.placeholder = "Selling Price ($)";
        cost.style.display = 'block';
        cost.placeholder = "Cost ($) [Sale Only]";
    }
}

async function addTransaction() {
    const custId = document.getElementById('txnCustomer').value;
    const type = document.getElementById('txnType').value;
    const amountStr = document.getElementById('txnAmount').value;
    const costStr = document.getElementById('txnCost').value;

    const amount = amountStr ? parseFloat(amountStr) : 0;
    const cost = costStr ? parseFloat(costStr) : 0;

    if (type !== 'WASTE' && (!custId || !amountStr)) return alert("Customer and Amount are required.");
    if (type === 'WASTE' && !costStr) return alert("Cost value required for SPOILAGE/WASTE.");

    const payload = {
        customer_id: type === 'WASTE' ? null : parseInt(custId),
        type: type,
        amount: type === 'WASTE' ? 0.0 : amount,
        cost_amount: cost
    };

    try {
        await fetch(`${API_URL}/accounting/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (type === 'WASTE' && typeof addAuditLog === 'function') {
            addAuditLog('SPOILAGE_RECORDED', `Logged inventory waste with value $${cost}`);
        }

        // Clear inputs
        document.getElementById('txnAmount').value = '';
        document.getElementById('txnCost').value = '';
        loadAccounting();
    } catch(err) { console.error(err); }
}
