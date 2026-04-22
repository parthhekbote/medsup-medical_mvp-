import React, { useState, useEffect } from 'react';
import { getCustomers, getFinancialSummary, createCustomer } from '../api';
import { Users, DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';

const Accounting = () => {
    const [customers, setCustomers] = useState([]);
    const [summary, setSummary] = useState({ total_profit: 0, total_loss: 0 });
    const [loading, setLoading] = useState(true);
    const [newCustomerName, setNewCustomerName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [custData, sumData] = await Promise.all([
                getCustomers(),
                getFinancialSummary()
            ]);
            setCustomers(custData);
            setSummary(sumData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!newCustomerName.trim()) return;

        try {
            await createCustomer(newCustomerName);
            setNewCustomerName('');
            loadData();
        } catch (err) {
            console.error("Failed to add customer", err);
        }
    };

    if (loading) return <div className="text-blue-400 animate-pulse">Loading accounting data...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users /> Customer Accounting
            </h2>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 border-l-4 border-emerald-500 flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-sm uppercase">Total Net Profit</p>
                        <h3 className="text-3xl font-bold text-white mt-1">${summary.total_profit}</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="glass-panel p-6 border-l-4 border-red-500 flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-sm uppercase">Total Loss</p>
                        <h3 className="text-3xl font-bold text-white mt-1">${summary.total_loss}</h3>
                    </div>
                    <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                        <TrendingDown size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Customer Form */}
                <div className="glass-panel p-6 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus size={18} /> Add Customer
                    </h3>
                    <form onSubmit={handleAddCustomer} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Customer Name</label>
                            <input
                                type="text"
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Enter name"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium transition-colors">
                            Create Customer
                        </button>
                    </form>
                </div>

                {/* Customer List */}
                <div className="lg:col-span-2 glass-panel p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                        <h3 className="font-bold">Customer Directory</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4 text-right">Debit</th>
                                    <th className="p-4 text-right">Credit</th>
                                    <th className="p-4 text-right">Balance</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {customers.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-800/30">
                                        <td className="p-4 font-medium text-white">{c.name}</td>
                                        <td className="p-4 text-right font-mono text-emerald-400">${c.debit}</td>
                                        <td className="p-4 text-right font-mono text-red-400">${c.credit}</td>
                                        <td className={`p-4 text-right font-bold font-mono ${c.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            ${c.balance}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="text-blue-400 hover:text-blue-300 text-xs">View</button>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">No customers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accounting;
