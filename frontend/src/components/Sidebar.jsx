import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    Users,
    CreditCard,
    BarChart3,
    FileText,
    ChevronLeft,
    ChevronRight,
    Activity
} from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/inventory', icon: <Package size={20} />, label: 'Inventory & Risk' },
        { path: '/pending', icon: <ClipboardList size={20} />, label: 'Pending Actions' },
        { path: '/accounting', icon: <Users size={20} />, label: 'Accounting' },
        { path: '/transactions', icon: <CreditCard size={20} />, label: 'Transactions' },
        { path: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
        { path: '/audit', icon: <FileText size={20} />, label: 'Audit Log' },
    ];

    return (
        <div className={`h-screen bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                {!collapsed && (
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Activity className="text-blue-500" />
                        <span>MED<span className="text-blue-500">OPS</span></span>
                    </h1>
                )}
                {collapsed && <Activity className="text-blue-500 mx-auto" />}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 transition-colors ${isActive
                                ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`
                        }
                    >
                        <span className="shrink-0">{item.icon}</span>
                        {!collapsed && <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                {!collapsed && (
                    <div className="text-xs text-slate-500">
                        <div className="font-semibold">System Status</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Online
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
