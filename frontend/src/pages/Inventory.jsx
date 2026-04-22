import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, CheckCircle, AlertOctagon, Filter, Search } from 'lucide-react';

const Inventory = () => {
    const { supplies, loading } = useOutletContext();
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return <div className="text-blue-400 animate-pulse">Loading inventory...</div>;

    const filteredSupplies = supplies.filter(s => {
        const matchesCondition =
            filter === 'ALL' ? true :
                filter === 'CRITICAL' ? (s.stock_status === 'Critical' || s.risk_level === 'Emergency') :
                    filter === 'LOW' ? (s.stock_status === 'Low') : true;

        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCondition && matchesSearch;
    });

    const getRiskBadge = (risk) => {
        const styles =
            risk === 'Emergency' ? 'bg-red-900/50 text-red-200 border-red-500' :
                risk === 'Warning' ? 'bg-orange-900/50 text-orange-200 border-orange-500' :
                    'bg-emerald-900/50 text-emerald-200 border-emerald-500';

        return (
            <span className={`px-2 py-1 rounded text-xs font-bold border ${styles}`}>
                {risk.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Inventory & Risk</h2>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search supplies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                        />
                    </div>

                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${filter === 'ALL' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>All</button>
                        <button onClick={() => setFilter('CRITICAL')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${filter === 'CRITICAL' ? 'bg-red-900/50 text-red-200' : 'text-slate-400 hover:text-white'}`}>Critical</button>
                        <button onClick={() => setFilter('LOW')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${filter === 'LOW' ? 'bg-orange-900/50 text-orange-200' : 'text-slate-400 hover:text-white'}`}>Low Stock</button>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-xl border border-slate-700">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-right">Stock</th>
                            <th className="p-4 text-right">Daily Use</th>
                            <th className="p-4 text-right">Days Left</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Risk Level</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredSupplies.map(supply => (
                            <tr key={supply.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 font-medium text-white">{supply.name}</td>
                                <td className="p-4">{supply.category}</td>
                                <td className="p-4 text-right font-mono">{supply.current_quantity}</td>
                                <td className="p-4 text-right">{supply.average_daily_usage.toFixed(1)}</td>
                                <td className="p-4 text-right">{(supply.current_quantity / supply.average_daily_usage).toFixed(1)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs ${supply.stock_status === 'Critical' ? 'text-red-400' :
                                            supply.stock_status === 'Low' ? 'text-orange-400' : 'text-emerald-400'
                                        }`}>
                                        {supply.stock_status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {getRiskBadge(supply.risk_level)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSupplies.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No supplies found matching filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
