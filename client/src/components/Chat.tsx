import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface ChatMessage {
  id: number;
  message: string;
  sender_type: 'member' | 'nutritionist';
  sender_id: number;
  first_name: string;
  last_name: string;
  profile_image?: string;
  message_type: 'text' | 'diet_plan' | 'file';
  file_url?: string;
  created_at: string;
  is_read: boolean;
}

interface ChatProps {
  requestId: number;
  currentUserId: number;
  currentUserRole: 'member' | 'nutritionist';
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ requestId, currentUserId, currentUserRole, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only auto-scroll if it's a new message, not during polling refresh
    if (messages.length > 0 && !isRefreshing) {
      scrollToBottom();
    }
  }, [messages, isRefreshing]);

  // Fetch chat messages
  const fetchMessages = async (isPolling = false) => {
    try {
      if (isPolling) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await fetch(`http://localhost:3001/api/chat/messages/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      if (isPolling) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/chat/send/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          messageType: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Send diet plan
  const sendDietPlan = async (dietPlan: string) => {
    if (!dietPlan.trim()) return;

    try {
      setIsSending(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/chat/send/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: dietPlan.trim(),
          messageType: 'diet_plan',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send diet plan');
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send diet plan');
    } finally {
      setIsSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:3001/api/chat/upload/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to upload file' }));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      
      // Reset file input
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsSending(false);
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages every 15 seconds
    const interval = setInterval(() => {
      // Only fetch if not currently sending a message
      if (!isSending) {
        fetchMessages(true); // true = isPolling
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [requestId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.sender_id === currentUserId;
  };

  const getMessageBubbleClass = (message: ChatMessage) => {
    const baseClass = "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm";
    if (isOwnMessage(message)) {
      return `${baseClass} bg-gradient-to-br from-purple-500 to-purple-600 text-white ml-auto border border-purple-400/20`;
    } else {
      return `${baseClass} bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600/20`;
    }
  };

  const getMessageTypeIcon = (message: ChatMessage) => {
    if (message.message_type === 'diet_plan') {
      return (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 px-3 py-1.5 rounded-full text-xs mb-3 font-medium backdrop-blur-sm">
          <span className="text-lg">📋</span>
          <span>Diet Plan</span>
        </div>
      );
    }
    if (message.message_type === 'file') {
      return (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-full text-xs mb-3 font-medium backdrop-blur-sm">
          <span className="text-lg">📄</span>
          <span>PDF Document</span>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-semibold">Loading chat...</p>
              <p className="text-gray-400 text-sm mt-1">Preparing your conversation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-700/50 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Diet Plan Chat
              </h3>
              <p className="text-sm text-gray-400">Request #{requestId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMessages(false)}
              disabled={isLoading}
              className={`group relative p-2.5 rounded-xl bg-gray-700/50 hover:bg-gray-600/70 transition-all duration-200 hover:scale-105 ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh messages"
            >
              <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="group p-2.5 rounded-xl bg-gray-700/50 hover:bg-red-500/20 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-6 h-6 text-gray-300 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-900/30 to-gray-800/30">
          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-center backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {isRefreshing && (
            <div className="text-center text-gray-400 py-3 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                <span className="text-sm font-medium">Checking for new messages...</span>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-12 animate-in fade-in duration-500">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700/50">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={getMessageBubbleClass(message)}>
                  {!isOwnMessage(message) && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                        {message.first_name.charAt(0)}{message.last_name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        {message.first_name} {message.last_name}
                      </span>
                    </div>
                  )}
                  
                  {getMessageTypeIcon(message)}
                  
                  {message.message_type === 'file' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">{message.message}</p>
                      {message.file_url && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-lg">📄</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-300">PDF Document</p>
                              <p className="text-xs text-gray-400">Click to download</p>
                            </div>
                            <a
                              href={`http://localhost:3001${message.file_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                  )}
                  
                  <div className={`text-xs mt-2 flex items-center gap-2 ${isOwnMessage(message) ? 'text-purple-200' : 'text-gray-400'}`}>
                    <span>{format(new Date(message.created_at), 'MMM d, h:mm a')}</span>
                    {message.is_read && isOwnMessage(message) && (
                      <span className="text-green-400">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-b-2xl">
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl focus:border-purple-400/70 focus:outline-none text-white resize-none transition-all duration-200 group-hover:border-gray-500/70 backdrop-blur-sm placeholder-gray-400"
                rows={2}
                disabled={isSending}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
            </div>
            <button
              onClick={sendMessage}
              disabled={isSending || !newMessage.trim()}
              className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSending || !newMessage.trim()
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105'
              }`}
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </div>
              )}
            </button>
          </div>
          
          {/* Quick Actions for Nutritionists */}
          {currentUserRole === 'nutritionist' && (
            <div className="mt-4 flex gap-3">
              <div className="relative">
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isSending}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300 rounded-xl text-sm font-medium transition-all duration-200 border border-green-500/30 hover:border-green-500/50 hover:scale-105 backdrop-blur-sm cursor-pointer ${
                    isSending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-lg">📄</span>
                  <span>Upload PDF Diet Plan</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
