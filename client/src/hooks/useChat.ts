import { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatResponses } from '../data/mockData';

export const useChat = (portal: string = 'public') => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  useEffect(() => {
    // Initialize chat with welcome message and suggestions
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: `Hi! I'm your AI fitness assistant. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    
    // Set suggested questions based on portal
    const responses = chatResponses[portal as keyof typeof chatResponses] || chatResponses.public;
    setSuggestedQuestions(Object.keys(responses));
  }, [portal]);

  const sendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = chatResponses[portal as keyof typeof chatResponses] || chatResponses.public;
      const response = responses[content as keyof typeof responses] || 
        "I'm sorry, I don't have information about that. Please contact our staff for more details.";

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const clearMessages = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: `Hi! I'm your AI fitness assistant. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return {
    isOpen,
    messages,
    suggestedQuestions,
    sendMessage,
    toggleChat,
    clearMessages
  };
};
