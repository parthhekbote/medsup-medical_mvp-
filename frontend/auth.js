/* Authentication and RBAC System */

const MOCK_USERS = {
    'ops.manager': {
        password: 'demo123',
        role: 'OPS_MANAGER',
        name: 'Sarah Chen',
        permissions: ['full_access']
    },
    'inventory.staff': {
        password: 'demo123',
        role: 'INVENTORY_STAFF',
        name: 'John Smith',
        permissions: ['view_inventory', 'record_stock']
    },
    'finance.admin': {
        password: 'demo123',
        role: 'FINANCE_ADMIN',
        name: 'Emma Davis',
        permissions: ['view_finance', 'view_ops_readonly']
    },
    'auditor': {
        password: 'demo123',
        role: 'AUDITOR',
        name: 'Michael Brown',
        permissions: ['view_audit', 'view_ops_readonly']
    }
};

// Menu permissions by role
const MENU_PERMISSIONS = {
    'ops-command': ['OPS_MANAGER', 'FINANCE_ADMIN', 'AUDITOR'],
    'inventory-intel': ['OPS_MANAGER', 'INVENTORY_STAFF'],
    'procurement': ['OPS_MANAGER'],
    'finance': ['OPS_MANAGER', 'FINANCE_ADMIN'],
    'audit': ['OPS_MANAGER', 'AUDITOR'],
    'settings': ['OPS_MANAGER']
};

// Action permissions by role
const ACTION_PERMISSIONS = {
    'approve_order': ['OPS_MANAGER'],
    'reject_order': ['OPS_MANAGER'],
    'record_stock': ['OPS_MANAGER', 'INVENTORY_STAFF'],
    'view_finance': ['OPS_MANAGER', 'FINANCE_ADMIN'],
    'modify_settings': ['OPS_MANAGER']
};

function login(username, password) {
    const user = MOCK_USERS[username];
    if (user && user.password === password) {
        const sessionUser = {
            username: username,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('currentUser', JSON.stringify(sessionUser));
        return sessionUser;
    }
    return null;
}

function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function hasPermission(action) {
    const user = getCurrentUser();
    if (!user) return false;

    const allowedRoles = ACTION_PERMISSIONS[action];
    return allowedRoles && allowedRoles.includes(user.role);
}

function canAccessMenu(menuMode) {
    const user = getCurrentUser();
    if (!user) return false;

    const allowedRoles = MENU_PERMISSIONS[menuMode];
    return allowedRoles && allowedRoles.includes(user.role);
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
