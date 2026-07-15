import { useState } from "react";
import { X, Dices, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface DiceModalProps {
  user: UserProfile;
  onClose: () => void;
  onSendRoll: (messageText: string) => Promise<void>;
}

export default function DiceModal({ onClose, onSendRoll }: DiceModalProps) {
  const [activeTab, setActiveTab] = useState<"dice" | "coin">("dice");
  const [selectedDice, setSelectedDice] = useState<number>(20); // Default D20
  const [diceCount, setDiceCount] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [announceToChat, setAnnounceToChat] = useState(true);
  
  // Results states
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [coinResult, setCoinResult] = useState<"Heads" | "Tails" | null>(null);
  const [isSuccessRoll, setIsSuccessRoll] = useState<boolean | null>(null);

  const rollDice = () => {
    setIsRolling(true);
    setCoinResult(null);
    setIsSuccessRoll(null);
    
    setTimeout(async () => {
      const results: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        results.push(Math.floor(Math.random() * selectedDice) + 1);
      }
      setDiceResults(results);
      setIsRolling(false);

      const total = results.reduce((sum, val) => sum + val, 0);
      
      const maxPossible = selectedDice * diceCount;
      const percentage = total / maxPossible;
      setIsSuccessRoll(percentage >= 0.7);

      if (announceToChat) {
        const payload = {
          type: "dice",
          diceType: selectedDice,
          diceCount: diceCount,
          results: results,
          total: total,
          critical: (selectedDice === 20 && total === 20) ? "hit" : (selectedDice === 20 && total === 1) ? "fail" : null
        };
        const msgText = `[DICE_ROLL]:${JSON.stringify(payload)}`;
        await onSendRoll(msgText);
      }
    }, 800);
  };

  const flipCoin = () => {
    setIsRolling(true);
    setDiceResults([]);
    setIsSuccessRoll(null);

    setTimeout(async () => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      setCoinResult(result);
      setIsRolling(false);

      if (announceToChat) {
        const payload = {
          type: "coin",
          coinResult: result
        };
        const msgText = `[DICE_ROLL]:${JSON.stringify(payload)}`;
        await onSendRoll(msgText);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Dices className="w-5 h-5 text-slate-300" />
            <h4 className="font-medium text-white text-sm">Dice & Coin Roller</h4>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-[#0a0f1d] shrink-0">
          <button
            onClick={() => {
              setActiveTab("dice");
              setDiceResults([]);
              setCoinResult(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "dice"
                ? "text-white border-white bg-white/[0.02]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.01]"
            }`}
          >
            🎲 Roll Dice
          </button>
          <button
            onClick={() => {
              setActiveTab("coin");
              setDiceResults([]);
              setCoinResult(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "coin"
                ? "text-white border-white bg-white/[0.02]"
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.01]"
            }`}
          >
            🪙 Flip Coin
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto bg-[#0a0f1d] flex-1 space-y-6">
          {activeTab === "dice" ? (
            <div className="space-y-5">
              {/* Dice Type Selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Choose Dice Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 10, 12, 20, 100].map((d) => {
                    const isSelected = selectedDice === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDice(d);
                          setDiceResults([]);
                        }}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-100 text-black border-slate-100 shadow-md"
                            : "bg-white/[0.01] border-white/10 text-slate-300 hover:bg-white/[0.03]"
                        }`}
                      >
                        D{d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dice Quantity</label>
                <div className="flex items-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((count) => {
                    const isSelected = diceCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setDiceCount(count);
                          setDiceResults([]);
                        }}
                        className={`w-9 h-9 rounded-full border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-slate-100 text-black border-slate-100 shadow-sm"
                            : "bg-white/[0.01] border-white/10 text-slate-300 hover:bg-white/[0.03]"
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-white/[0.02] border border-white/10 shadow-sm">
                <span className="text-3xl">🪙</span>
              </div>
              <p className="text-xs text-slate-400">Flip a coin to decide Heads or Tails instantly.</p>
            </div>
          )}

          {/* Announce Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-white">Announce Roll in Chat</p>
              <p className="text-[10px] text-slate-500">Posts the result to the room automatically</p>
            </div>
            <button
              type="button"
              onClick={() => setAnnounceToChat(!announceToChat)}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer flex ${
                announceToChat ? "bg-slate-200 justify-end" : "bg-white/10 justify-start"
              }`}
            >
              <span className={`w-4 h-4 rounded-full block shadow-sm ${announceToChat ? 'bg-black' : 'bg-slate-400'}`} />
            </button>
          </div>

          {/* Action Area & Animated Output */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            {isRolling ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                  {activeTab === "dice" ? "Rolling Dice..." : "Flipping Coin..."}
                </p>
              </div>
            ) : (
              <>
                {/* Dice Result Display */}
                {activeTab === "dice" && diceResults.length > 0 && (
                  <div className={`p-4 rounded-xl border text-center transition-all bg-white/[0.02] border-white/10`}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                      {isSuccessRoll && <Sparkles className="w-3.5 h-3.5 text-slate-300 animate-pulse" />}
                      Result
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {diceResults.map((val, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-sm font-semibold text-white font-mono">
                          {val}
                        </div>
                      ))}
                    </div>
                    {diceCount > 1 && (
                      <p className="text-xs font-medium text-slate-300 mt-3 bg-white/[0.02] inline-block px-3 py-1 rounded-lg border border-white/5">
                        Total: <span className="text-white font-mono text-sm">{diceResults.reduce((s, v) => s + v, 0)}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Coin Result Display */}
                {activeTab === "coin" && coinResult && (
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Flipped</p>
                    <p className="text-lg font-semibold text-white tracking-wider">
                      {coinResult}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={activeTab === "dice" ? rollDice : flipCoin}
                  className="w-full py-3 rounded-xl font-semibold text-xs uppercase tracking-wider bg-slate-100 hover:bg-white text-black shadow-lg shadow-black/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Dices className="w-4 h-4" />
                  {activeTab === "dice" ? `Roll ${diceCount}d${selectedDice}` : "Flip Coin"}
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
