import { useState, FormEvent } from "react";
import { X, Eye, EyeOff, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatusMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }
    
    setLoading(true);
    setStatusMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setStatusMessage({ type: "success", text: "Welcome back!" });
      // App.tsx listener will handle the UI switch
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        id="login-modal-container"
        className="relative w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle top light bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to continue chatting on VelvetChat</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mock Status Alerts */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-semibold border ${
            statusMessage.type === "success" 
              ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-300" 
              : "bg-rose-950/30 border-rose-500/20 text-rose-300"
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Username Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email or Username</label>
            <input
              type="text"
              id="login-email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[#111827]/60 text-slate-100 placeholder-slate-500 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Password Input */}
          <div className="relative space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#111827]/60 text-slate-100 placeholder-slate-500 border border-white/10 rounded-xl py-3 px-4 text-sm pr-10 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3.5 top-[13px] text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(109,40,217,0.25)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <button 
            type="button"
            onClick={() => alert("Simulation: Reset link sent to your email!")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Forgot password?
          </button>
          <div className="text-slate-400">
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="text-violet-400 hover:text-violet-300 font-bold hover:underline cursor-pointer transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
