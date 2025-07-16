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
              <i className="fas fa-robot text-blue-400 text-xl mr-2"></i>
              <span className="font-bold text-blue-400" style={{ fontFamily: 'Orbitron, monospace' }}>
                AI ASSISTANT
              </span>
            </div>
            <button onClick={toggleChat} className="text-gray-400 hover:text-white">
              <i className="fas fa-times"></i>
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
      
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover-glow transition-all duration-300 animate-pulse-glow"
      >
        <i className="fas fa-robot text-xl"></i>
      </button>
    </div>
  );
};
