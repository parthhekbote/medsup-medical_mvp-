import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import { MessageSquare, X } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const Layout = ({ supplies, loading }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <main className="flex-1 h-full overflow-hidden relative flex flex-col">
                <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
                    <h2 className="text-lg font-semibold text-slate-200">
                        {/* Dynamic Header could go here based on route */}
                        Medical Operations Center
                    </h2>
                    <div className="text-sm text-slate-500">
                        {new Date().toLocaleDateString()}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 relative">
                    <Outlet context={{ supplies, loading }} />
                </div>

                {/* Floating AI Assistant */}
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                    {isChatOpen && (
                        <div className="mb-4 w-[400px] h-[600px] shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-900 animate-in slide-in-from-bottom-10 fade-in duration-200">
                            <div className="h-full flex flex-col">
                                <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
                                    <span className="font-semibold flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        AIP Assistant
                                    </span>
                                    <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <ChatInterface />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${isChatOpen ? 'bg-slate-700 text-slate-300' : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                    >
                        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Layout;
