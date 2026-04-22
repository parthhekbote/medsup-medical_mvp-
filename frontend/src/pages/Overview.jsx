import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, AlertOctagon, TrendingUp, DollarSign } from 'lucide-react';

const Overview = () => {
    const { supplies, loading } = useOutletContext();

    if (loading) return <div className="text-blue-400 animate-pulse">Loading dashboard data...</div>;

    const criticalCount = supplies.filter(s => s.stock_status === 'Critical' || s.risk_level === 'Emergency').length;
    const lowStockCount = supplies.filter(s => s.stock_status === 'Low').length;
    const totalSupplies = supplies.length;

    // Mock Financial Data
    const todayProfit = 1250.00;
    const todayRevenue = 4500.00;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Critical Alerts Card */}
                <div className="glass-panel p-6 border-l-4 border-red-500 relative overflow-hidden group">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Critical Alerts</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{criticalCount}</h3>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
                            <AlertOctagon size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-red-300">
                        Immediate attention required
                    </div>
                </div>

                {/* Low Stock Card */}
                <div className="glass-panel p-6 border-l-4 border-orange-500 relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Low Stock</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{lowStockCount}</h3>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-orange-300">
                        Reorder suggested
                    </div>
                </div>

                {/* Daily Revenue Card */}
                <div className="glass-panel p-6 border-l-4 border-blue-500 relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Today's Revenue</p>
                            <h3 className="text-4xl font-bold text-white mt-2">${todayRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-blue-300 flex items-center gap-1">
                        <TrendingUp size={14} /> +12% from yesterday
                    </div>
                </div>

                {/* Profit Card */}
                <div className="glass-panel p-6 border-l-4 border-emerald-500 relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Net Profit</p>
                            <h3 className="text-4xl font-bold text-white mt-2">${todayProfit.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-emerald-300">
                        28% Margin
                    </div>
                </div>
            </div>

            {/* Placeholder for Graphs/Charts later */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 h-64 flex items-center justify-center text-slate-500">
                    [Activity Chart Placeholder]
                </div>
                <div className="glass-panel p-6 h-64 flex items-center justify-center text-slate-500">
                    [Stock Trend Placeholder]
                </div>
            </div>
        </div>
    );
};

export default Overview;
