import { useState, FormEvent } from "react";
import { X, Plus, Trash2, CheckSquare } from "lucide-react";
import { UserProfile } from "../types";

interface PollModalProps {
  user: UserProfile;
  onClose: () => void;
  onSend: (pollData: { question: string; mode: string; duration: string; options: string[] }) => void;
}

export default function PollModal({ onClose, onSend }: PollModalProps) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("Normal - show voters");
  const [duration, setDuration] = useState("1 hour");
  const [options, setOptions] = useState<string[]>(["", ""]); // starts with 2 empty options

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      alert("Please enter a poll question.");
      return;
    }
    // Filter out blank options
    const finalOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (finalOptions.length < 2) {
      alert("Please provide at least 2 non-empty options for the poll.");
      return;
    }

    onSend({
      question: question.trim(),
      mode,
      duration,
      options: finalOptions
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-slate-300" />
            <div>
              <h2 className="text-sm font-medium tracking-tight text-white">Create Room Poll</h2>
              <p className="text-[10px] text-slate-400">Ask the room and watch live results update.</p>
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[80vh]">
          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What should we do tonight?"
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-normal text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Voting Mode & Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Voting mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-normal text-white focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
              >
                <option value="Normal - show voters" className="bg-[#0a0f1d]">Normal - show voters</option>
                <option value="Anonymous - hide voters" className="bg-[#0a0f1d]">Anonymous - hide voters</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-normal text-white focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
              >
                <option value="15 mins" className="bg-[#0a0f1d]">15 mins</option>
                <option value="1 hour" className="bg-[#0a0f1d]">1 hour</option>
                <option value="1 day" className="bg-[#0a0f1d]">1 day</option>
                <option value="Unlimited" className="bg-[#0a0f1d]">Unlimited</option>
              </select>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Options (2 to 5)</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-normal text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2.5 bg-white/[0.01] hover:bg-red-950/20 border border-white/10 hover:border-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-1 flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add option
              </button>
            )}
          </div>

          {/* Submit & Disclaimer */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-100 hover:bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-black/10"
            >
              📝 Create Poll
            </button>
            <p className="text-[10px] text-slate-500 leading-relaxed text-center px-2">
              Polls allow plain text only. Links, styled text, and HTML formatting are automatically filtered for room safety.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
