import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatPanel = ({ messages, onSendMessage, role, isChatOpen, onToggleChat }) => {
  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-700/50 transition-transform duration-300 ${isChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'}`}>
      <div className="p-3 border-b border-slate-700/50 flex justify-between items-center cursor-pointer" onClick={onToggleChat}>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-blue-400">Chat</h3>
        </div>
        <span className="text-xs text-slate-400">{messages.length} messages</span>
      </div>
      
      {isChatOpen && (
        <>
          <div className="p-4 h-80 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === role ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.sender === role
                    ? 'bg-indigo-600/50 text-white'
                    : 'bg-slate-700/50 text-slate-300'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-60">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-700/50">
            <form onSubmit={onSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow bg-slate-900/50 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPanel;
