import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  created_at: string;
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat history');
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    return supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          if (!isOpen) {
            setShowNotification(true);
          }
        }
      )
      .subscribe();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || loading) return;

    const messageContent = message.trim();
    setMessage('');
    setLoading(true);

    try {
      const { error: userMessageError } = await supabase
        .from('chat_messages')
        .insert({
          content: messageContent,
          user_id: user.id,
          sender: 'user'
        });

      if (userMessageError) throw userMessageError;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessage(messageContent);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setShowNotification(false);
        }}
        className="fixed bottom-4 right-4 bg-[#39ff14]/10 text-[#39ff14] p-4 rounded-full hover:bg-[#39ff14]/20 transition-all duration-300 group"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {showNotification && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-[#39ff14] rounded-full" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[380px] h-[500px] bg-black/90 backdrop-blur-sm rounded-lg border border-[#39ff14]/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#39ff14]/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#39ff14]" />
          <h3 className="font-syncopate text-[#39ff14] text-sm tracking-wider">SUPPORT CHAT</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#39ff14]/60 hover:text-[#39ff14] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-2 max-w-[80%] ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-6 h-6 flex-shrink-0 rounded-full bg-[#39ff14]/10 flex items-center justify-center`}>
                <User className="w-4 h-4 text-[#39ff14]" />
              </div>
              <div
                className={`p-3 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#39ff14]/10 text-[#39ff14]'
                    : 'bg-black/50 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#39ff14]/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-black/50 border border-[#39ff14]/20 rounded px-4 py-2 text-[#39ff14] placeholder-[#39ff14]/30 focus:outline-none focus:border-[#39ff14]/50 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-[#39ff14]/10 text-[#39ff14] p-2 rounded hover:bg-[#39ff14]/20 transition-all duration-300 disabled:opacity-50 group"
          >
            <Send className={`w-5 h-5 ${loading ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'}`} />
          </button>
        </div>
      </form>
    </div>
  );
}