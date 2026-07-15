import React, { useState } from "react";
import { X, Bell, Trash2, Mail, Info, ShieldAlert } from "lucide-react";
import { UserProfile, Notification } from "../types";
import { supabase } from "../lib/supabase";

interface NotificationsModalProps {
  user: UserProfile;
  notifications: Notification[];
  onClose: () => void;
  onClearAll: () => void;
  onOpenDecision: (notif: Notification) => void;
}

export default function NotificationsModal({
  user,
  notifications,
  onClose,
  onClearAll,
  onOpenDecision,
}: NotificationsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDismiss = async (id: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      await supabase.from("notifications").delete().eq("target_id", user.id);
      onClearAll();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatMessageText = (msg: string) => {
    if (msg.startsWith("[REVEAL_REQUEST:")) {
      return msg.replace(/\[REVEAL_REQUEST:[^\]]+\]/, "").trim();
    }
    return msg;
  };

  const isRevealRequest = (msg: string) => {
    return msg.startsWith("[REVEAL_REQUEST:");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#110e1c]/95 border border-purple-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-950/40 bg-[#161226]/50">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-purple-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none">Notifications</h4>
              <p className="text-[10px] text-purple-400 font-bold tracking-wider mt-1 uppercase">Updates & Requests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                disabled={isDeleting}
                onClick={handleClearAll}
                className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                title="Clear All"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-950/30 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[250px] max-h-[500px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-950/25 border border-purple-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-500/60" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inbox is empty</p>
                <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto mt-1">
                  You have no pending notifications or reveal requests.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => {
              const revealReq = isRevealRequest(notif.message);
              return (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-xl border transition-all flex gap-3 relative group ${
                    revealReq 
                      ? "bg-purple-950/15 border-purple-500/30 hover:bg-purple-950/25 cursor-pointer" 
                      : "bg-slate-900/40 border-white/5 hover:border-purple-500/10"
                  }`}
                  onClick={() => {
                    if (revealReq) {
                      onOpenDecision(notif);
                      onClose();
                    }
                  }}
                >
                  {/* Sender Avatar */}
                  <div className="relative shrink-0">
                    <img 
                      src={notif.sender_pfp || "https://musicvibe.io/default_images/avatar/default_system.png"} 
                      alt="Sender"
                      className="w-8 h-8 rounded-full border border-purple-500/20 object-cover"
                      onError={(e) => {
                        (e.target as any).src = "https://api.dicebear.com/7.x/identicon/svg?seed=" + (notif.sender_username || "Notification");
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center">
                      {revealReq ? (
                        <Mail className="w-2.5 h-2.5 text-purple-400" />
                      ) : (
                        <Info className="w-2.5 h-2.5 text-blue-400" />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-black text-slate-200">
                        {notif.sender_username || "System"}
                      </span>
                      {notif.sender_rank && notif.sender_rank !== "MEMBER" && (
                        <span className="text-[8px] font-extrabold px-1 py-0.2 rounded uppercase bg-purple-500/20 text-purple-300">
                          {notif.sender_rank}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 font-medium">
                        {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed break-words">
                      {formatMessageText(notif.message)}
                    </p>
                    {revealReq && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md">
                        <span>Click to Respond</span>
                      </div>
                    )}
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(notif.id);
                    }}
                    className="absolute right-2 top-2 p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
