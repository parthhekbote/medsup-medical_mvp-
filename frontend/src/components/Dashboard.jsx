import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Package } from 'lucide-react';

const Dashboard = ({ supplies }) => {
    const [filter, setFilter] = useState('ALL');

    const filteredSupplies = supplies.filter(s => {
        if (filter === 'ALL') return true;
        if (filter === 'CRITICAL') return s.stock_status === 'Critical' || s.risk_level !== 'Safe';
        return true;
    });

    const getStatusColor = (status, risk) => {
        if (risk === 'Emergency') return 'text-red-500 border-red-500';
        if (risk === 'Warning') return 'text-orange-500 border-orange-500';
        if (status === 'Critical') return 'text-red-400 border-red-400';
        if (status === 'Low') return 'text-yellow-400 border-yellow-400';
        return 'text-green-400 border-green-400';
    };

    const getIcon = (risk) => {
        if (risk === 'Emergency') return <AlertOctagon className="w-6 h-6 text-red-500" />;
        if (risk === 'Warning') return <AlertTriangle className="w-6 h-6 text-orange-500" />;
        return <CheckCircle className="w-6 h-6 text-green-500" />;
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package /> Situation Awareness
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg glass-panel ${filter === 'ALL' ? 'bg-blue-600' : ''}`}
                    >
                        All Supplies
                    </button>
                    <button
                        onClick={() => setFilter('CRITICAL')}
                        className={`px-4 py-2 rounded-lg glass-panel flex items-center gap-2 ${filter === 'CRITICAL' ? 'bg-red-900/50 border-red-500' : ''}`}
                    >
                        <AlertTriangle size={16} /> Risk & Critical
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupplies.map(supply => (
                    <div
                        key={supply.id}
                        className={`glass-panel p-5 border-l-4 transition-transform hover:-translate-y-1 ${getStatusColor(supply.stock_status, supply.risk_level)} 
                        ${supply.risk_level === 'Emergency' ? 'critical-glow' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{supply.name}</h3>
                                <span className="text-sm text-gray-400">{supply.category}</span>
                            </div>
                            {getIcon(supply.risk_level)}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Stock Status:</span>
                                <span className="font-semibold">{supply.stock_status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Current Qty:</span>
                                <span className="font-mono text-white">{supply.current_quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Risk Level:</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${supply.risk_level === 'Emergency' ? 'bg-red-900 text-red-200' :
                                        supply.risk_level === 'Warning' ? 'bg-orange-900 text-orange-200' : 'bg-green-900 text-green-200'
                                    }`}>
                                    {supply.risk_level.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
