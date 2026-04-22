import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu } from 'lucide-react';
import { chatWithAI } from '../api';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Hello. I am the Medical Supply Operational AI. I can monitor inventory, assess risks, and simulate scenarios. How can I assist you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatWithAI(userMsg.content);
            // Clean up response if it returns markdown block wrapper
            const cleanContent = response.response;
            setMessages(prev => [...prev, { role: 'system', content: cleanContent }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: '⚠️ Error: Unable to connect to Operational Core.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const questions = [
        "Are we at risk of running out of syringes?",
        "Which supplies are critical today?",
        "Simulate: What if ICU demand doubles?"
    ];

    const formatMessage = (content) => {
        // Basic formatting for the structured response
        // Identify headers and bold them
        return content.split('\n').map((line, i) => {
            if (line.trim().startsWith('📌') || line.trim().startsWith('📊') || line.trim().startsWith('⚠️') || line.trim().startsWith('💡') || line.trim().startsWith('🔍')) {
                return <div key={i} className="font-bold mt-2 mb-1 text-blue-300">{line}</div>;
            }
            return <div key={i} className="min-h-[1.2em]">{line}</div>;
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center gap-2 bg-slate-800">
                <Cpu className="text-blue-400" />
                <h2 className="font-bold text-lg">Operational Assistant</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
              ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap leading-relaxed 
              ${msg.role === 'user' ? 'bg-blue-900/50 text-blue-50' : 'bg-slate-800 text-slate-100 border border-slate-700'}`}>
                            {msg.role === 'system' ? formatMessage(msg.content) : msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center animate-pulse"><Bot size={16} /></div>
                        <div className="bg-slate-800 rounded-lg p-3 text-sm text-gray-400">Analyzing supply data...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {questions.map((q, i) => (
                        <button key={i} onClick={() => setInput(q)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full whitespace-nowrap text-slate-300 border border-slate-600">
                            {q}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about inventory risks..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
