"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Hash, Plus, Smile, Image as ImageIcon, 
  LogOut, MessageSquare, Send, X 
} from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State Channel Dinamis
  const [channels, setChannels] = useState<string[]>(["general", "mabar-game"]);
  const [activeChannel, setActiveChannel] = useState("general");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  // Fungsi Tambah Channel Baru
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    
    const formattedName = newChannelName.toLowerCase().replace(/\s+/g, "-");
    
    if (!channels.includes(formattedName)) {
      setChannels([...channels, formattedName]);
      setActiveChannel(formattedName);
    }
    
    setNewChannelName("");
    setShowAddModal(false);
  };

  // Trigger Input File Gambar
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Fitur upload gambar untuk file "${file.name}" siap dipasang ke Supabase Storage!`);
    }
  };

  // Fetch Message dari Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

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
    <div className="flex h-screen bg-[#313338] text-gray-200 font-sans select-none relative">
      
      {/* Hidden File Input untuk Gambar */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* POPUP TAMBAH CHANNEL */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#313338] w-96 rounded-lg p-6 shadow-2xl relative border border-[#232428]">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Buat Text Channel</h2>
            <p className="text-xs text-gray-400 mb-4">Tambahkan tempat baru untuk ngobrol topik tertentu.</p>
            
            <form onSubmit={handleAddChannel}>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Nama Channel</label>
                <div className="flex items-center bg-[#1e1f22] rounded px-3 py-2">
                  <Hash size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="misal: lounge-santai"
                    className="bg-transparent text-white text-sm outline-none w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white hover:underline"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded transition"
                >
                  Buat Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. SIDEBAR SERVER */}
      <div className="flex flex-col items-center py-3 w-18 bg-[#1e1f22] gap-3 border-r border-[#232428]">
        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-indigo-500 flex items-center justify-center text-white font-bold transition-all cursor-pointer">
          <MessageSquare size={24} />
        </div>
        <div className="w-8 h-[2px] bg-[#35363c] rounded" />
        
        {/* Tombol Plus Server */}
        <button 
          onClick={() => setShowAddModal(true)}
          type="button"
          title="Tambah Channel Baru"
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-emerald-500 text-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 2. SIDEBAR CHANNEL */}
      <div className="w-60 bg-[#2b2d31] flex flex-col justify-between border-r border-[#232428]">
        <div>
          <div className="h-12 border-b border-[#1f2023] px-4 flex items-center font-bold text-white shadow-sm">
            My Community Server
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Text Channels
              </span>
              <button 
                onClick={() => setShowAddModal(true)} 
                type="button"
                className="text-gray-400 hover:text-white"
                title="Tambah Channel"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {channels.map((ch) => (
              <button 
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium transition mb-1 ${
                  activeChannel === ch ? "bg-[#404249] text-white" : "text-gray-400 hover:bg-[#35373c] hover:text-gray-200"
                }`}
              >
                <Hash size={18} className="text-gray-400" />
                {ch}
              </button>
            ))}
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

      {/* 3. CHAT AREA */}
      <div className="flex-1 flex flex-col justify-between bg-[#313338]">
        {/* Header Chat */}
        <div className="h-12 border-b border-[#232428] px-4 flex items-center justify-between shadow-sm bg-[#313338]">
          <div className="flex items-center gap-2 font-bold text-white">
            <Hash size={24} className="text-gray-400" />
            <span>{activeChannel}</span>
          </div>
        </div>

        {/* List Pesan */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Belum ada pesan di #{activeChannel}. Ketik sesuatu di bawah!</div>
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

        {/* Input Chat + Tombol Gambar + Tombol Send */}
        <div className="p-4">
          <form onSubmit={sendMessage} className="bg-[#383a40] rounded-lg p-2.5 flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setShowAddModal(true)}
              className="text-gray-400 hover:text-white transition"
              title="Tambah Channel"
            >
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
              {/* Tombol Gambar Active */}
              <button 
                type="button" 
                onClick={handleImageClick}
                className="hover:text-white transition"
                title="Pilih Gambar"
              >
                <ImageIcon size={20} />
              </button>

              <button type="button" className="hover:text-white transition"><Smile size={20} /></button>
              
              {/* Tombol Kirim (Send Icon) */}
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className={`p-1.5 rounded-full transition ${
                  newMessage.trim() ? "bg-indigo-500 text-white hover:bg-indigo-600" : "text-gray-500 cursor-not-allowed"
                }`}
                title="Kirim Pesan"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. MEMBER LIST */}
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