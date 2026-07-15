import { useState } from "react";
import { X, RefreshCw, ArrowRightLeft, ShieldAlert } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

interface ConvertModalProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

export default function ConvertModal({ user, onUpdateUser, onClose }: ConvertModalProps) {
  const [direction, setDirection] = useState<"gold_to_rubies" | "rubies_to_gold">("gold_to_rubies");
  const [inputValue, setInputValue] = useState<number | "">("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const GOLD_PER_RUBY = 100;
  const currentGold = user.coins ?? 1000;
  const currentRubies = user.rubies ?? 10;

  const handleConvert = async () => {
    setError(null);
    setSuccessMessage(null);

    const val = Number(inputValue);
    if (!inputValue || isNaN(val) || val <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setIsConverting(true);

    try {
      let newGold = currentGold;
      let newRubies = currentRubies;
      let msg = "";

      if (direction === "gold_to_rubies") {
        if (currentGold < val) {
          setError(`Insufficient Gold. You only have ${currentGold} Gold.`);
          setIsConverting(false);
          return;
        }
        
        const gainedRubies = Math.floor(val / GOLD_PER_RUBY);
        if (gainedRubies <= 0) {
          setError(`Min gold to convert is ${GOLD_PER_RUBY} Gold (which gives 1 Ruby)`);
          setIsConverting(false);
          return;
        }

        const spentGold = gainedRubies * GOLD_PER_RUBY;
        newGold = currentGold - spentGold;
        newRubies = currentRubies + gainedRubies;
        msg = `Successfully converted ${spentGold} Gold to ${gainedRubies} Rubies.`;
      } else {
        if (currentRubies < val) {
          setError(`Insufficient Rubies. You only have ${currentRubies} Rubies.`);
          setIsConverting(false);
          return;
        }

        const gainedGold = val * GOLD_PER_RUBY;
        newGold = currentGold + gainedGold;
        newRubies = currentRubies - val;
        msg = `Successfully converted ${val} Rubies to ${gainedGold} Gold.`;
      }

      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          coins: newGold,
          rubies: newRubies
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      onUpdateUser({ coins: newGold, rubies: newRubies });

      await supabase.from("notifications").insert({
        target_id: user.id,
        sender_id: user.id,
        sender_username: "Bank",
        sender_pfp: "https://musicvibe.io/default_images/rank/bot.svg",
        sender_rank: "BOT",
        message: msg
      });

      setSuccessMessage(msg);
      setInputValue("");
    } catch (err: any) {
      console.error("Conversion failed:", err);
      setError("Failed to convert currency. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const calculatedOutput = () => {
    if (!inputValue || isNaN(Number(inputValue))) return 0;
    const val = Number(inputValue);
    if (direction === "gold_to_rubies") {
      return Math.floor(val / GOLD_PER_RUBY);
    } else {
      return val * GOLD_PER_RUBY;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-4 h-4 text-slate-300" />
            <h4 className="text-sm font-medium text-white tracking-tight">Royal Currency Exchange</h4>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Exchange Rates Reference */}
          <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Exchange Rate</p>
            <div className="flex justify-center items-center gap-3 mt-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span>🪙</span>
                <span className="text-white font-medium">100 Gold</span>
              </div>
              <span className="text-slate-500">=</span>
              <div className="flex items-center gap-1.5">
                <span>♦️</span>
                <span className="text-white font-medium">1 Ruby</span>
              </div>
            </div>
          </div>

          {/* User Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Your Gold</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span>🪙</span>
                <span className="text-xs font-semibold text-white">{currentGold}</span>
              </div>
            </div>
            
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Your Rubies</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span>♦️</span>
                <span className="text-xs font-semibold text-white">{currentRubies}</span>
              </div>
            </div>
          </div>

          {/* Selector Direction */}
          <div className="flex bg-white/[0.01] border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => {
                setDirection("gold_to_rubies");
                setError(null);
                setSuccessMessage(null);
                setInputValue("");
              }}
              className={`flex-1 py-1.5 text-[10px] uppercase font-semibold tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                direction === "gold_to_rubies" 
                  ? "bg-slate-100 text-black shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Gold 🪙 → Ruby ♦️
            </button>
            <button
              onClick={() => {
                setDirection("rubies_to_gold");
                setError(null);
                setSuccessMessage(null);
                setInputValue("");
              }}
              className={`flex-1 py-1.5 text-[10px] uppercase font-semibold tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                direction === "rubies_to_gold" 
                  ? "bg-slate-100 text-black shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Ruby ♦️ → Gold 🪙
            </button>
          </div>

          {/* Amount input block */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                Amount to Exchange
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  placeholder={direction === "gold_to_rubies" ? "e.g. 1000" : "e.g. 10"}
                  value={inputValue}
                  onChange={(e) => {
                    setError(null);
                    setSuccessMessage(null);
                    setInputValue(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value)));
                  }}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors placeholder-slate-500"
                />
                <span className="absolute right-3.5 top-2.5 text-sm">
                  {direction === "gold_to_rubies" ? "🪙" : "♦️"}
                </span>
              </div>
            </div>

            {/* Estimated outcome summary */}
            {inputValue !== "" && !isNaN(Number(inputValue)) && Number(inputValue) > 0 && (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Receipt</span>
                <span className="font-semibold text-white">
                  {direction === "gold_to_rubies" ? "♦️ " : "🪙 "}
                  {calculatedOutput()} {direction === "gold_to_rubies" ? "Rubies" : "Gold"}
                </span>
              </div>
            )}
          </div>

          {/* Toast feedback alerts */}
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl flex items-center gap-2 text-red-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl flex flex-col gap-1 text-emerald-300 text-xs text-center font-semibold">
              <span>🎉 Transaction Success</span>
              <span className="text-[10px] font-normal text-slate-300">{successMessage}</span>
            </div>
          )}

          {/* Submit and closes */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isConverting}
              className="flex-1 py-3 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5 font-semibold text-xs uppercase rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={isConverting || !inputValue}
              className="flex-1 py-3 bg-slate-100 hover:bg-white disabled:bg-white/5 disabled:text-slate-500 text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Exchange</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
