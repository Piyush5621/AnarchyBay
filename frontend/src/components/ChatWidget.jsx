import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const initialMessage = { 
    role: 'model', 
    text: `👋 **Welcome to Anarchy Bay!** \n\nThe marketplace for **Digital Assets & Skills**. I can help you:\n\n* 💻 **Find Source Code** & Projects\n* 🚀 **Start Selling** your work\n* 🛠 **Hire Skilled** developers\n\n*What are you building today?*`
  };
  const [messages, setMessages] = useState([initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleClearChat = () => {
    setMessages([initialMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);

    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', text: "⚠️ Network error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* 🟢 THE CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 lg:w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[550px] animate-fade-in-up origin-bottom-right transition-all">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></div>
                <div className="absolute top-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Anarchy Assistant</h3>
                <p className="text-[10px] text-gray-300">Online & Ready</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleClearChat} className="text-gray-400 hover:text-white transition-colors" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[90%] p-3 text-sm rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    // ✅ FIX: Wrapped in a DIV instead of passing className to ReactMarkdown
                    <div className="prose prose-sm max-w-none 
                        prose-p:mb-2 prose-p:leading-relaxed 
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:font-bold prose-strong:text-gray-900
                        prose-ul:list-disc prose-ul:pl-4 prose-ul:mb-2
                        prose-ol:list-decimal prose-ol:pl-4 prose-ol:mb-2
                        /* Table Styles */
                        prose-table:border-collapse prose-table:w-full prose-table:my-2 prose-table:text-xs
                        prose-th:bg-gray-100 prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-gray-300
                        prose-td:p-2 prose-td:border prose-td:border-gray-300">
                      
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex gap-1 items-center">
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input 
              ref={inputRef}
              type="text" 
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ask for products or help..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md"
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-1 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium">Powered by Gemini AI</p>
          </div>
        </div>
      )}

      {/* 🔵 Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
};

export default ChatWidget;