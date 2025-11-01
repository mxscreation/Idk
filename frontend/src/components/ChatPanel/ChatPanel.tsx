import { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socket';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for AI messages
    const handleAIMessage = (data: any) => {
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: data.text, timestamp: data.timestamp },
      ]);
    };

    socketService.on('chat:aiMessage', handleAIMessage);

    return () => {
      socketService.off('chat:aiMessage', handleAIMessage);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      type: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send to backend
    socketService.emit('chat:message', {
      text: inputText,
      timestamp: Date.now(),
    });

    setInputText('');
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-bold mb-2 text-gray-200">Chat with AI</h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-2 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.type === 'user'
                ? 'bg-blue-600 text-white ml-auto max-w-[80%]'
                : 'bg-gray-700 text-gray-200 mr-auto max-w-[80%]'
            }`}
          >
            <div className="text-sm">{msg.text}</div>
            <div className="text-xs opacity-60 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-gray-700 rounded text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
