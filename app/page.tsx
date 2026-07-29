'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DiscordClone() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [username, setUsername] = useState(''); // Diset kosong dulu

  useEffect(() => {
    // Generasi username hanya dilakukan di browser (client-side)
    setUsername('User_' + Math.floor(Math.random() * 1000));

    // 1. Ambil pesan lama
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // 2. Dengarkan pesan baru secara Real-time
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    await supabase.from('messages').insert([{ user_name: username, content: text }]);
    setText('');
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white font-sans">
      {/* Sidebar Server */}
      <div className="w-18 bg-gray-900 p-3 flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl cursor-pointer hover:rounded-xl transition-all">
          D
        </div>
      </div>

      {/* Sidebar Channels */}
      <div className="w-60 bg-gray-800 flex flex-col border-r border-gray-700">
        <div className="p-4 border-b border-gray-700 font-bold shadow-sm">My Server</div>
        <div className="p-3 text-gray-400 text-sm font-semibold">TEXT CHANNELS</div>
        <div className="px-3 py-1 text-gray-300 bg-gray-700/50 rounded mx-2 font-medium cursor-pointer">
          # general
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-600 font-bold text-lg flex justify-between items-center">
          <span># general</span>
          <span className="text-xs text-gray-400 font-normal">Logged as: {username || 'Loading...'}</span>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-indigo-400 text-sm">{msg.user_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-200 text-sm">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <form onSubmit={sendMessage} className="p-4 bg-gray-700">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message #general"
            className="w-full bg-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
        </form>
      </div>
    </div>
  );
}