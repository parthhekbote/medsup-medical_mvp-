import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Clock, Activity } from 'lucide-react';

const AuditLog = () => {
    // In a real app, we'd fetch these from the backend.
    // For now, we'll keep a local state or use a simple context mock if needed.
    // Since the legacy app used client-side logs for demo, we'll replicate that or fetch if backend exists.

    // NOTE: Backend doesn't seem to have a dedicated /audit endpoint yet based on my exploration.
    // I will mock this for the UI demonstration as per the plan.

    const [logs, setLogs] = useState([
        { id: 1, action: 'SYSTEM_BOOT', details: 'System initialized successfully.', time: new Date().toLocaleTimeString() },
        { id: 2, action: 'INVENTORY_CHECK', details: 'Automatic stock level verification complete.', time: new Date(Date.now() - 50000).toLocaleTimeString() },
        { id: 3, action: 'USER_LOGIN', details: 'Operator logged in from terminal A1.', time: new Date(Date.now() - 120000).toLocaleTimeString() }
    ]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText /> System Audit Log
            </h2>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-4 w-32">Time</th>
                            <th className="p-4 w-48">Action</th>
                            <th className="p-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/30">
                                <td className="p-4 font-mono text-slate-500">{log.time}</td>
                                <td className="p-4 font-bold text-blue-400">{log.action}</td>
                                <td className="p-4 text-slate-300">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLog;
