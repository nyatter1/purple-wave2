import { useState, FormEvent } from "react";
import { X, Eye, EyeOff, UserPlus } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { supabase } from "../lib/supabase";

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ onClose, onSwitchToLogin }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("MALE");
  const [age, setAge] = useState<number>(18);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate ages from 7 to 1000
  const ageOptions = Array.from({ length: 1000 - 7 + 1 }, (_, i) => 7 + i);
  const genderOptions = ["MALE", "FEMALE", "OTHER"];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !email.trim()) {
      setStatusMessage({ type: "error", text: "Please fill in all text fields" });
      return;
    }
    
    setLoading(true);
    setStatusMessage(null);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          username: username.trim(),
          gender,
          age,
        }
      }
    });

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setStatusMessage({ 
        type: "success", 
        text: "Registration successful! You can now log in." 
      });
      // In a real app, might need email confirmation, but usually auto-logs in if enabled
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
        id="register-modal-container"
        className="relative w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle top light bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-400 mt-1">Join VelvetChat to start messaging right now</p>
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
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Username</label>
            <input
              type="text"
              id="register-username"
              placeholder="Your handle name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
                id="register-password"
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

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
            <input
              type="email"
              id="register-email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[#111827]/60 text-slate-100 placeholder-slate-500 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Gender and Age custom selectors (Grid format) */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <CustomSelect
              id="register-gender"
              label="Gender"
              value={gender}
              options={genderOptions}
              onChange={(val) => setGender(val)}
              disabled={loading}
            />

            <CustomSelect
              id="register-age"
              label="Age"
              value={age}
              options={ageOptions}
              onChange={(val) => setAge(Number(val))}
              enableSearch={true}
              disabled={loading}
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(109,40,217,0.25)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        {/* Footnote Terms of Use */}
        <p className="mt-5 text-center text-[11px] text-slate-500 leading-normal">
          By registering, you agree to the{" "}
          <a href="#terms" onClick={() => alert("Simulation: Terms of Use")} className="underline hover:text-slate-400 transition-colors">
            Terms of Use
          </a>
        </p>

        {/* Login redirect link */}
        <div className="mt-6 text-center text-xs border-t border-white/5 pt-5">
          <span className="text-slate-400">Already have an account? </span>
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-violet-400 hover:text-violet-300 font-bold hover:underline cursor-pointer transition-colors"
          >
            Log in instead
          </button>
        </div>
      </div>
    </div>
  );
}
