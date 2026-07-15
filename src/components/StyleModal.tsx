import { useState } from 'react';
import { UserProfile } from '../types';
import { X, Type, MessageSquare, Save, Sparkles } from 'lucide-react';

interface StyleModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (updates: Partial<UserProfile>) => void | Promise<void>;
}

export default function StyleModal({ user, onClose, onUpdate }: StyleModalProps) {
  const [activeTab, setActiveTab] = useState<'username' | 'message'>('username');

  const [usernameColor, setUsernameColor] = useState(user.username_color || '#ffffff');
  const [messageColor, setMessageColor] = useState(user.message_color || '#e2e8f0');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({
      username_color: usernameColor,
      message_color: messageColor,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-slate-300" />
            <div>
              <h2 className="text-sm font-medium text-white tracking-tight">Style Customizer</h2>
              <p className="text-[10px] text-slate-400">Personalize your name and chat message appearance.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-[#0a0f1d]">
          <button
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'username' 
                ? 'text-white border-white bg-white/[0.02]' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Username
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'message' 
                ? 'text-white border-white bg-white/[0.02]' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat Message
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-5">
          
          {/* Preview Panel */}
          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1.5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Live Preview</span>
            <div className="flex flex-col gap-0.5">
              <span 
                className="text-xs font-bold flex items-center gap-1"
                style={{ color: activeTab === 'username' ? usernameColor : user.username_color }}
              >
                {user.username}
                
              </span>
              <span 
                className="text-xs"
                style={{ color: activeTab === 'message' ? messageColor : user.message_color }}
              >
                Hello, this is how your chat text looks!
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            
            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={activeTab === 'username' ? usernameColor : messageColor}
                  onChange={(e) => activeTab === 'username' ? setUsernameColor(e.target.value) : setMessageColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <input 
                  type="text"
                  value={activeTab === 'username' ? usernameColor : messageColor}
                  onChange={(e) => activeTab === 'username' ? setUsernameColor(e.target.value) : setMessageColor(e.target.value)}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white w-full outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/5 font-semibold text-xs uppercase rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-slate-100 hover:bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
