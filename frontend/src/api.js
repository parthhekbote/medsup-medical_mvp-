import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// ---- Inventory ----
export const getSupplies = async () => {
    const response = await api.get('/inventory/status');
    // Transform backend shape to frontend shape
    return response.data.map(item => ({
        id: item.supply_id,
        name: item.name,
        category: item.department,
        current_quantity: item.quantity,
        stock_status: item.stock_status,
        risk_level: item.risk_level,
        average_daily_usage: item.details?.avg_usage || 0,
        lead_time: item.details?.lead_time || 7,
    }));
};

// ---- AI Chat ----
export const chatWithAI = async (query) => {
    const response = await api.post('/ai/query', { query });
    return response.data;
};

// ---- Accounting ----
export const getCustomers = async () => {
    const response = await api.get('/accounting/customers');
    return response.data;
};

export const getFinancialSummary = async () => {
    const response = await api.get('/accounting/summary');
    return response.data;
};

export const createCustomer = async (name) => {
    const response = await api.post('/accounting/customers', { name });
    return response.data;
};

// ---- Orders ----
export const createOrderRequest = async (supplyId, quantity) => {
    const response = await api.post('/orders/request', {
        supply_id: supplyId,
        quantity: quantity,
    });
    return response.data;
};

export const processOrder = async (orderId, action) => {
    const response = await api.post('/orders/process', {
        order_id: orderId,
        action: action, // "APPROVE" or "REJECT"
    });
    return response.data;
};
