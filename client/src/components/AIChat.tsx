import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

interface AIChatProps {
  portal: string;
}

export const AIChat = ({ portal }: AIChatProps) => {
  const { isOpen, messages, suggestedQuestions, sendMessage, toggleChat } = useChat(portal);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 chat-bubble rounded-2xl flex flex-col animate-bounce-in">
          <div className="p-4 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-2 neon-glow">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                AI ASSISTANT
              </span>
            </div>
            <button onClick={toggleChat} className="close-button text-gray-300 hover:text-white p-2 rounded-lg" title="Close">
              <span className="text-lg font-normal leading-none" aria-hidden="true">×</span>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white ml-8'
                    : 'bg-gray-800 text-gray-300 mr-8'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
            
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="space-y-2">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-blue-400 p-2 rounded text-sm transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-600">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg hover-glow transition-all duration-300"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Toggle Button - AI Badge */}
      <button
        onClick={toggleChat}
        className="group relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 hover:from-blue-600 hover:via-purple-700 hover:to-cyan-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-110 flex items-center justify-center overflow-hidden border border-blue-400/20"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 4s ease infinite'
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-cyan-400/20 animate-pulse"></div>
        
        {/* Main icon */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20 mb-1">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <span className="text-xs font-bold tracking-wider text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
            AI
          </span>
        </div>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        
        {/* Pulse ring effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-ping"></div>
        
        {/* Notification dot */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        )}
      </button>
    </div>
  );
};
