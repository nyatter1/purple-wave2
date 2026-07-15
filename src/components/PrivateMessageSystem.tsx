import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Minus, Settings, Trash2, 
  Send, Plus, Smile, Image as ImageIcon, Mic, StopCircle, 
  Palette, Dices, Coins, MessageSquare, Check
} from "lucide-react";
import { UserProfile, PrivateMessage } from "../types";
import { firestore } from "../lib/supabase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import PaintModal from "./PaintModal";
import DiceModal from "./DiceModal";

interface Props {
  user: UserProfile;
  activeChats: string[]; // array of user IDs
  onCloseChat: (userId: string) => void;
  onOpenChat: (userId: string) => void;
  allProfiles: UserProfile[];
  isOnlinePanelOpen: boolean;
  messages: PrivateMessage[];
  onClearThread: (otherId: string) => void;
}

export default function PrivateMessageSystem({ 
  user, 
  activeChats, 
  onCloseChat, 
  onOpenChat, 
  allProfiles,
  isOnlinePanelOpen,
  messages,
  onClearThread
}: Props) {
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(new Set());

  const toggleMinimize = (id: string) => {
    setMinimizedChats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* Active Chat Windows */}
      <div className="fixed z-40 bottom-4 right-4 flex gap-4 items-end pointer-events-none">
        <AnimatePresence>
          {activeChats.map(chatUserId => {
            return (
              <ChatWindow 
                key={chatUserId}
                user={user}
                otherUserId={chatUserId}
                allProfiles={allProfiles}
                messages={messages.filter(m => m.thread_id === `${user.id}_${chatUserId}` || m.thread_id === `${chatUserId}_${user.id}`).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}
                onClose={() => onCloseChat(chatUserId)}
                onMinimize={() => toggleMinimize(chatUserId)}
                isMinimized={minimizedChats.has(chatUserId)}
                onClearThread={() => onClearThread(chatUserId)}
                isOnlinePanelOpen={isOnlinePanelOpen}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}

interface ChatWindowProps {
  key?: string;
  user: UserProfile;
  otherUserId: string;
  allProfiles: UserProfile[];
  messages: PrivateMessage[];
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
  onClearThread: () => void;
  isOnlinePanelOpen: boolean;
}

function ChatWindow({ 
  user, 
  otherUserId, 
  allProfiles, 
  messages, 
  onClose, 
  onMinimize, 
  isMinimized, 
  onClearThread,
  isOnlinePanelOpen
}: ChatWindowProps) {
  const otherUser = allProfiles.find(p => p.id === otherUserId);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Modals
  const [showPaintModal, setShowPaintModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  useEffect(() => {
    // Mark unread messages as read
    const unreadMsgs = messages.filter(m => !m.is_read && m.recipient_id === user.id);
    unreadMsgs.forEach(m => {
      updateDoc(doc(firestore, "private_messages", m.id), { is_read: true }).catch(()=>{});
    });
  }, [messages, user.id]);

  const handleSend = async (type: PrivateMessage['type'] = 'text', content?: any) => {
    if (type === 'text' && !text.trim()) return;

    const thread_id = user.id < otherUserId ? `${user.id}_${otherUserId}` : `${otherUserId}_${user.id}`;
    
    const msg: Partial<PrivateMessage> = {
      thread_id,
      sender_id: user.id,
      sender_username: user.username,
      sender_pfp: user.pfp,
      recipient_id: otherUserId,
      type,
      created_at: new Date().toISOString(),
      is_read: false
    };

    if (type === 'text') msg.text = text.trim();
    else if (type === 'image') msg.image_url = content as string;
    else if (type === 'voice') msg.voice_url = content as string;
    else if (type === 'paint') {
      msg.type = 'paint';
      msg.image_url = content as string;
    }

    setText("");
    setShowOptions(false);
    
    try {
      await addDoc(collection(firestore, "private_messages"), msg);
    } catch (e) {
      console.error(e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          handleSend('voice', reader.result);
        };
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleSend('image', base64);
    };
    reader.readAsDataURL(file);
    setShowOptions(false);
  };

  const renderDiceRoll = (msg: PrivateMessage) => {
    try {
      const jsonStr = msg.text?.replace('[DICE_ROLL]:', '').trim() || "";
      const rollData = JSON.parse(jsonStr);

      const isDice = rollData.type === "dice";
      
      if (isDice) {
        const { diceType, diceCount, results, total, critical } = rollData;
        
        let borderClass = "border-purple-500/30 bg-gradient-to-br from-[#120e24]/80 to-[#1e133d]/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]";
        let titleColor = "text-purple-300";
        let badgeBg = "bg-purple-500/20 text-purple-300 border-purple-500/20";
        let badgeText = `🎲 Dice Roll`;
        
        if (critical === "hit") {
          borderClass = "border-amber-500/50 bg-gradient-to-br from-amber-950/40 to-yellow-950/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]";
          titleColor = "text-amber-400";
          badgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/30";
          badgeText = "✨ CRITICAL HIT!";
        } else if (critical === "fail") {
          borderClass = "border-rose-500/50 bg-gradient-to-br from-rose-950/40 to-red-950/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]";
          titleColor = "text-rose-400";
          badgeBg = "bg-rose-500/20 text-rose-300 border-rose-500/30";
          badgeText = "💀 CRITICAL FAIL!";
        }

        return (
          <div className={`mt-1 border rounded-xl p-3 max-w-[240px] w-full shadow-lg transition-all duration-300 ${borderClass} text-white space-y-2 text-left`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badgeBg}`}>
                {badgeText}
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-400">
                {diceCount}d{diceType}
              </span>
            </div>

            {/* Results Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1.5 flex-wrap py-0.5">
                {results.map((val: number, idx: number) => {
                  let dieBg = "bg-purple-950/50 border-purple-500/30 text-white";
                  if (diceType === 20 && val === 20) {
                    dieBg = "bg-amber-500/25 border-amber-400 text-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                  } else if (diceType === 20 && val === 1) {
                    dieBg = "bg-rose-500/25 border-rose-500 text-rose-300";
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`w-7 h-7 rounded-lg border flex flex-col items-center justify-center text-[11px] font-black shadow-inner font-mono ${dieBg}`}
                    >
                      <span>{val}</span>
                      <span className="text-[5px] text-white/40 -mt-0.5 font-sans">d{diceType}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total/Summary */}
              <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-1">
                <span className="font-extrabold text-purple-300 uppercase tracking-wide">
                  {diceCount > 1 ? "Sum:" : "Result:"}
                </span>
                <div className={`flex items-center gap-1 font-black ${titleColor}`}>
                  {diceCount > 1 && (
                    <span className="text-[8px] text-purple-400 font-mono font-medium">
                      ({results.join("+")}) =
                    </span>
                  )}
                  <span className="font-mono text-xs font-black">{total}</span>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Coin flip rendering
        const { coinResult } = rollData;
        const isHeads = coinResult === "Heads";
        
        const borderClass = isHeads 
          ? "border-amber-500/40 bg-gradient-to-br from-[#120e24]/80 to-[#271d10]/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          : "border-indigo-500/40 bg-gradient-to-br from-[#120e24]/80 to-[#101935]/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]";
          
        const badgeBg = isHeads
          ? "bg-amber-500/20 text-amber-300 border-amber-500/20"
          : "bg-indigo-500/20 text-indigo-300 border-indigo-500/20";
          
        return (
          <div className={`mt-1 border rounded-xl p-3 max-w-[240px] w-full shadow-lg transition-all duration-300 ${borderClass} text-white space-y-2 text-left`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badgeBg}`}>
                🪙 Coin Flip
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-400">
                1d2
              </span>
            </div>

            {/* Coin Details */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border shadow shrink-0 ${
                  isHeads
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 border-yellow-300 text-amber-950"
                    : "bg-gradient-to-r from-indigo-500 to-cyan-600 border-cyan-300 text-indigo-950"
                }`}>
                  {isHeads ? "🪙" : "🛡️"}
                </div>
                <div>
                  <p className="text-[8px] text-purple-400 font-bold uppercase tracking-wider">Flipped</p>
                  <p className={`text-xs font-black uppercase tracking-widest ${isHeads ? "text-amber-400" : "text-cyan-400"}`}>
                    {coinResult}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } catch (err) {
      console.error("Dice roll render error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Dice Roll.</p>;
    }
  };

  if (!otherUser) return null;

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0}
      className="pointer-events-auto bg-[#131024]/95 border-purple-500/20 shadow-2xl flex flex-col w-72 sm:w-80 shadow-[0_10px_50px_rgba(0,0,0,0.5)] rounded-2xl border border-purple-900/50"
      style={{ 
        height: isMinimized ? '48px' : '400px',
        zIndex: 40
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-purple-900/40 bg-[#1b1532]/80 cursor-move shrink-0 relative overflow-hidden">
        {otherUser.nameplate && (
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <video
              src={otherUser.nameplate}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex items-center gap-2 relative z-10">
          <img src={otherUser.pfp} alt="" className="w-7 h-7 rounded-full border border-purple-500/30 object-cover" />
          <span className="font-bold text-sm text-purple-100 truncate max-w-[120px] flex items-center gap-1">
            {otherUser.username}
          </span>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 text-purple-400 hover:text-white transition-colors cursor-pointer" title="Settings">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMinimize} className="p-1 text-purple-400 hover:text-white transition-colors cursor-pointer" title="Minimize">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1 text-purple-400 hover:text-rose-400 transition-colors cursor-pointer" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-2 border-b border-purple-900/40 bg-[#1b1532]/50 flex justify-end shrink-0">
          <button 
            onClick={() => { onClearThread(); setShowSettings(false); }}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Clear History
          </button>
        </div>
      )}

      {/* Body */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0c0919]/40 scrollbar-thin scrollbar-thumb-purple-900/50">
          {messages.length === 0 && (
            <p className="text-xs text-purple-400/50 text-center py-4">No messages yet. Say hi!</p>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === user.id;
            const isDiceText = msg.text?.startsWith('[DICE_ROLL]:');
            
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img src={msg.sender_pfp} alt="" className="w-6 h-6 rounded-full border border-purple-500/30 shrink-0 object-cover" />
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {isDiceText ? (
                    renderDiceRoll(msg)
                  ) : (
                    <div className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-[#1b1532] text-purple-200 border border-purple-900/40 rounded-tl-sm'}`}>
                      {msg.type === 'text' && <p className="break-words font-medium">{msg.text}</p>}
                      {msg.type === 'image' && <img src={msg.image_url} alt="Shared" className="rounded-xl max-w-full max-h-40 object-cover mt-1 cursor-pointer hover:opacity-90" />}
                      {msg.type === 'paint' && <img src={msg.image_url} alt="Paint" className="rounded-xl max-w-full max-h-40 bg-white" />}
                      {msg.type === 'voice' && <audio src={msg.voice_url} controls className="h-8 max-w-full w-40 mt-1" />}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8px] text-purple-400/60 font-medium">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <span title={msg.is_read ? 'Read' : 'Delivered'}>
                        {msg.is_read ? <Check className="w-3 h-3 text-emerald-400" /> : <Check className="w-3 h-3 text-purple-500/30" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      {!isMinimized && (
        <div className="p-2 border-t border-purple-900/40 bg-[#161226] relative shrink-0">
          {showOptions && (
            <div className="absolute bottom-full left-2 mb-2 bg-[#1b1532] border border-purple-900/50 rounded-xl p-2 shadow-xl flex gap-1 z-50">
              <button onClick={() => { setShowPaintModal(true); setShowOptions(false); }} className="p-2 text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg transition-colors cursor-pointer" title="Paint">
                <Palette className="w-4 h-4" />
              </button>
              <button onClick={() => { fileInputRef.current?.click(); }} className="p-2 text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg transition-colors cursor-pointer" title="Upload Image">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button onClick={() => { setShowDiceModal(true); setShowOptions(false); }} className="p-2 text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg transition-colors cursor-pointer" title="Roll Dice">
                <Dices className="w-4 h-4" />
              </button>
              <button onClick={async () => { 
                const payload = { type: "coin", coinResult: Math.random() > 0.5 ? 'Heads' : 'Tails' };
                await handleSend('text', `[DICE_ROLL]:${JSON.stringify(payload)}`);
              }} className="p-2 text-purple-300 hover:text-white hover:bg-purple-600/30 rounded-lg transition-colors cursor-pointer" title="Flip Coin">
                <Coins className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-[#0d0a1c] border border-purple-950/50 rounded-full px-2 py-1 shadow-inner focus-within:border-purple-600/60 transition-colors">
            <button onClick={() => setShowOptions(!showOptions)} className="p-1.5 text-purple-400 hover:text-white hover:bg-purple-950 rounded-full transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <input 
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend('text'); }}
              placeholder="Type here..."
              className="flex-1 bg-transparent border-none text-[11px] text-purple-100 placeholder-purple-500/70 focus:outline-none py-1"
            />
            {isRecording ? (
              <button onClick={stopRecording} className="p-1.5 text-rose-400 hover:text-rose-300 animate-pulse bg-rose-500/10 rounded-full transition-colors cursor-pointer">
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={startRecording} className="p-1.5 text-purple-400 hover:text-white hover:bg-purple-950 rounded-full transition-colors cursor-pointer">
                <Mic className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => handleSend('text')}
              disabled={!text.trim()}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${text.trim() ? "bg-purple-600 text-white hover:bg-purple-500" : "text-purple-600/40"}`}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
      )}

      {showPaintModal && (
        <PaintModal
          onClose={() => setShowPaintModal(false)}
          onSend={(base64) => { handleSend('paint', base64); setShowPaintModal(false); }}
        />
      )}
      {showDiceModal && (
        <DiceModal
          user={user}
          onClose={() => setShowDiceModal(false)}
          onSendRoll={async (msgText) => {
            await handleSend('text', msgText);
            setShowDiceModal(false);
          }}
        />
      )}
    </motion.div>
  );
}
