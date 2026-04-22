import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createOrderRequest, processOrder } from '../api';
import { AlertCircle, Check, X, Bell } from 'lucide-react';

const PendingActions = () => {
    const { supplies } = useOutletContext();
    const [actions, setActions] = useState([]);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        if (supplies.length > 0) {
            generateActions();
        }
    }, [supplies]);

    const generateActions = () => {
        const newActions = supplies
            .filter(s => s.stock_status !== 'Healthy')
            .map(s => ({
                id: s.id,
                title: `Restock ${s.name}`,
                supply_name: s.name,
                current_stock: s.current_quantity,
                stock_status: s.stock_status,
                risk_level: s.risk_level,
                suggested_qty: 100, // simplified logic
                daily_usage: s.average_daily_usage
            }))
            .sort((a, b) => (a.risk_level === 'Emergency' ? -1 : 1));

        setActions(newActions);
    };

    const handleApprove = async (actionItem) => {
        setProcessing(actionItem.id);
        try {
            // 1. Create Request
            const orderRes = await createOrderRequest(actionItem.id, actionItem.suggested_qty);
            // 2. Auto Process (Demo mode)
            await processOrder(orderRes.id, 'APPROVE');

            // Remove from list
            setActions(prev => prev.filter(a => a.id !== actionItem.id));
        } catch (err) {
            console.error("Approval failed", err);
        } finally {
            setProcessing(null);
        }
    };

    const handleIgnore = (id) => {
        setActions(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell /> Pending Actions
            </h2>

            <div className="space-y-4">
                {actions.map(action => (
                    <div
                        key={action.id}
                        className={`glass-panel p-5 border-l-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${action.risk_level === 'Emergency' ? 'border-red-500 bg-red-900/10' : 'border-orange-500 bg-orange-900/10'
                            }`}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${action.risk_level === 'Emergency' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                <h3 className="font-bold text-lg text-white">{action.title}</h3>
                            </div>
                            <p className="text-sm text-slate-400">
                                Current Stock: <span className="text-white font-mono">{action.current_stock}</span> •
                                Status: <span className={action.stock_status === 'Critical' ? 'text-red-400' : 'text-orange-400'}>{action.stock_status}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Est. Buffer: {(action.current_stock / (action.daily_usage || 1)).toFixed(1)} days
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleApprove(action)}
                                disabled={processing === action.id}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {processing === action.id ? 'Processing...' : <><Check size={18} /> Approve Restock</>}
                            </button>
                            <button
                                onClick={() => handleIgnore(action.id)}
                                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors"
                            >
                                <X size={18} /> Ignore
                            </button>
                        </div>
                    </div>
                ))}

                {actions.length === 0 && (
                    <div className="glass-panel p-12 text-center flex flex-col items-center gap-4 text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                            <Check size={32} className="text-emerald-500" />
                        </div>
                        <p>All clear! No pending actions required.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingActions;
