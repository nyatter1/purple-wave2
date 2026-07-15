import { useState, FormEvent } from "react";
import { X, Gift, Send } from "lucide-react";
import { UserProfile } from "../types";

interface GiftModalProps {
  user: UserProfile;
  onClose: () => void;
  onSend: (message: string, style: string) => void;
}

const BOX_STYLES = [
  { id: "Classic", name: "Classic", colors: "from-red-500/20 to-rose-600/20", border: "border-red-500/30 hover:border-red-500/60", activeBorder: "border-red-500", glow: "shadow-red-500/5", emoji: "🎁" },
  { id: "Royal", name: "Royal", colors: "from-purple-500/20 to-indigo-600/20", border: "border-purple-500/30 hover:border-purple-500/60", activeBorder: "border-purple-500", glow: "shadow-purple-500/5", emoji: "👑" },
  { id: "Neon", name: "Neon", colors: "from-fuchsia-500/20 via-purple-500/20 to-cyan-500/20", border: "border-cyan-400/30 hover:border-cyan-400/60", activeBorder: "border-cyan-400", glow: "shadow-cyan-400/10", emoji: "✨" },
  { id: "Candy", name: "Candy", colors: "from-pink-400/20 to-amber-500/20", border: "border-pink-400/30 hover:border-pink-400/60", activeBorder: "border-pink-400", glow: "shadow-pink-400/5", emoji: "🍬" },
  { id: "Ice", name: "Ice", colors: "from-sky-400/20 to-blue-500/20", border: "border-sky-400/30 hover:border-sky-400/60", activeBorder: "border-sky-400", glow: "shadow-sky-400/5", emoji: "❄️" },
  { id: "Dark", name: "Dark", colors: "from-stone-700/20 to-neutral-900/20", border: "border-stone-500/30 hover:border-stone-500/60", activeBorder: "border-stone-400", glow: "shadow-neutral-500/5", emoji: "🕷️" },
  { id: "Gold", name: "Gold", colors: "from-yellow-400/20 to-amber-500/20", border: "border-yellow-400/30 hover:border-yellow-400/60", activeBorder: "border-yellow-400", glow: "shadow-yellow-400/10", emoji: "🌟" },
  { id: "Love", name: "Love", colors: "from-red-400/20 to-pink-500/20", border: "border-rose-400/30 hover:border-rose-400/60", activeBorder: "border-rose-400", glow: "shadow-rose-400/5", emoji: "💖" },
];

export default function GiftModal({ user, onClose, onSend }: GiftModalProps) {
  const [message, setMessage] = useState("");
  const [activeStyle, setActiveStyle] = useState("Classic");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please write a message to put inside the Gift Box.");
      return;
    }
    
    const userRubies = user.rubies ?? 0;
    if (userRubies < 5) {
      alert(`Creating a Gift Box costs 5 Rubies. You only have ${userRubies} Rubies.`);
      return;
    }

    onSend(message.trim(), activeStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-slate-300" />
            <div>
              <h2 className="text-sm font-medium tracking-tight text-white">Gift Box</h2>
              <p className="text-[10px] text-slate-400">Wrap a hidden message in an animated gift box</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost Ribbon */}
        <div className="bg-white/[0.02] px-6 py-2.5 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Cost: <span className="text-white font-semibold">5 Rubies</span>
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
            Cooldown: 30s
          </span>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
          {/* Gift Message */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gift message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a clean hidden message..."
              maxLength={250}
              className="w-full h-24 bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-normal text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Pick box style</label>
            <div className="grid grid-cols-4 gap-2">
              {BOX_STYLES.map((style) => {
                const isSelected = activeStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setActiveStyle(style.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? `${style.activeBorder} bg-white/[0.03] shadow-md ${style.glow} scale-[1.03] z-10`
                        : `${style.border} bg-white/[0.01] hover:bg-white/[0.03]`
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{style.emoji}</span>
                    </div>
                    <span className={`text-[9px] font-medium ${isSelected ? "text-white" : "text-slate-400"}`}>
                      {style.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-white/5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 font-semibold text-xs uppercase rounded-xl transition-all border border-white/5 text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-slate-100 hover:bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-black/10"
            >
              <Send className="w-3.5 h-3.5" /> Send Gift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
