"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // sesuaikan path jika kamu simpan di utils/supabase/client
import { 
  Hash, Plus, Smile, Image as ImageIcon, Users, 
  Settings, LogOut, MessageSquare 
} from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeChannel, setActiveChannel] = useState("general");

  // Format Jam
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  // Ambil Data Chat dari Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    // Realtime Listener
    const channel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Kirim Pesan
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from("messages").insert([
      {
        content: newMessage,
        user_name: username,
      },
    ]);

    setNewMessage("");
  };

  // Pop-up Login Sederhana (Biar Gak "User_479" Lagi)
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#313338] text-white">
        <form onSubmit={handleLogin} className="w-96 rounded-lg bg-[#2b2d31] p-6 shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Selamat Datang Kembali!</h1>
            <p className="text-sm text-gray-400">Masukkan username kamu buat mulai ngobrol.</p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded bg-[#1e1f22] p-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Contoh: GenZAce"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-600"
          >
            Masuk ke Server
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#313338] text-gray-200 font-sans select-none">
      
      {/* 1. SIDEBAR SERVER (Kiri Sangat) */}
      <div className="flex flex-col items-center py-3 w-18 bg-[#1e1f22] gap-3 border-r border-[#232428]">
        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-indigo-500 flex items-center justify-center text-white font-bold transition-all cursor-pointer">
          <MessageSquare size={24} />
        </div>
        <div className="w-8 h-[2px] bg-[#35363c] rounded" />
        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-emerald-500 text-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer">
          <Plus size={24} />
        </div>
      </div>

      {/* 2. SIDEBAR CHANNEL (Kiri Tengah) */}
      <div className="w-60 bg-[#2b2d31] flex flex-col justify-between border-r border-[#232428]">
        <div>
          {/* Server Title */}
          <div className="h-12 border-b border-[#1f2023] px-4 flex items-center font-bold text-white shadow-sm">
            My Community Server
          </div>

          {/* Channels List */}
          <div className="p-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Text Channels
            </div>
            
            <button 
              onClick={() => setActiveChannel("general")}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium transition ${
                activeChannel === "general" ? "bg-[#404249] text-white" : "text-gray-400 hover:bg-[#35373c] hover:text-gray-200"
              }`}
            >
              <Hash size={18} className="text-gray-400" />
              general
            </button>
            
            <button 
              onClick={() => setActiveChannel("mabar")}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium transition mt-1 ${
                activeChannel === "mabar" ? "bg-[#404249] text-white" : "text-gray-400 hover:bg-[#35373c] hover:text-gray-200"
              }`}
            >
              <Hash size={18} className="text-gray-400" />
              mabar-game
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="h-14 bg-[#232428] px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white leading-tight">{username}</span>
              <span className="text-[10px] text-emerald-400">#Online</span>
            </div>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            title="Logout" 
            className="text-gray-400 hover:text-red-400 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* 3. CHAT AREA (Tengah) */}
      <div className="flex-1 flex flex-col justify-between bg-[#313338]">
        {/* Chat Header */}
        <div className="h-12 border-b border-[#232428] px-4 flex items-center justify-between shadow-sm bg-[#313338]">
          <div className="flex items-center gap-2 font-bold text-white">
            <Hash size={24} className="text-gray-400" />
            <span>{activeChannel}</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Belum ada pesan. Ketik sesuatu di bawah!</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-3 hover:bg-[#2e3035] -mx-4 px-4 py-1 rounded transition">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(msg.user_name || "User").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
                      {msg.user_name || "User"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {msg.created_at ? formatTime(msg.created_at) : 'Baru saja'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-0.5">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Box Pro */}
        <div className="p-4">
          <form onSubmit={sendMessage} className="bg-[#383a40] rounded-lg p-2.5 flex items-center gap-3">
            <button type="button" className="text-gray-400 hover:text-white transition">
              <Plus size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Kirim pesan ke #${activeChannel}`}
              className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-500"
            />
            <div className="flex items-center gap-2 text-gray-400">
              <button type="button" className="hover:text-white transition"><ImageIcon size={20} /></button>
              <button type="button" className="hover:text-white transition"><Smile size={20} /></button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. MEMBER LIST (Kanan) */}
      <div className="w-60 bg-[#2b2d31] p-4 hidden lg:block border-l border-[#232428]">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Online — 1
        </div>
        <div className="flex items-center gap-3 p-1.5 rounded hover:bg-[#35373c] cursor-pointer transition">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="w-3 h-3 bg-emerald-500 border-2 border-[#2b2d31] rounded-full absolute bottom-0 right-0"></div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-none">{username}</div>
            <div className="text-[10px] text-gray-400 mt-1">Lagi mabar</div>
          </div>
        </div>
      </div>

    </div>
  );
}
