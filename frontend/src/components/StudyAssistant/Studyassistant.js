import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Bot, Loader, MessageSquare } from 'lucide-react';

const StudyAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { 
      text: inputMessage, 
      isBot: false,
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await axios.post('/api/chat', {
        message: inputMessage
      });

      const botResponse = response.data;
      
      setMessages(prev => [
        ...prev,
        { 
          text: botResponse.reply, 
          isBot: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        text: "⚠ Error: Unable to connect to the server. Please try again later.", 
        isBot: true,
        timestamp: new Date().toISOString()
      }]);
    }

    setInputMessage('');
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl h-screen flex flex-col text-gray-100 border border-gray-700">
      <div className="mb-6 border-b border-gray-700 pb-4 flex items-center gap-3">
        <Bot className="text-blue-400" size={32} />
        <h1 className="text-3xl font-bold text-blue-400">AI Study Assistant</h1>
      </div>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }} 
        className="flex-1 overflow-y-auto p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 space-y-4 backdrop-blur-lg"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 p-4">
            <MessageSquare size={48} className="mx-auto text-blue-400" />
            <p className="text-lg font-medium">Hello! How can I assist you today?</p>
            <p className="text-sm mt-2">Try asking: "CBSE Class 10 Maths resources"</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: msg.isBot ? -50 : 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3 }} 
            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-xl ${msg.isBot ? 'bg-gray-700 text-gray-100' : 'bg-blue-500 text-white'} shadow-lg`}> 
              <div className="text-sm">{msg.text}</div>
              <div className="text-xs mt-2 text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="max-w-[80%] p-4 bg-gray-700 rounded-xl border border-gray-600 ml-4 flex items-center gap-2">
              <Loader className="animate-spin text-blue-400" size={20} />
              Searching for the best resources...
            </div>
          </motion.div>
        )}
      </motion.div>
      <div className="flex gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask for study resources..."
          className="flex-1 p-3 border border-gray-600 rounded-lg focus:outline-none bg-gray-900 text-gray-100"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-500 transition-all flex items-center gap-2 text-sm font-bold shadow-md"
        >
          <Send size={18} /> Send
        </button>
      </div>
    </div>
  );
};

export default StudyAssistant;
