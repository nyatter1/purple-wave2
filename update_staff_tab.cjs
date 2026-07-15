const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regexStaffTab = /(\{rightPanelTab === "online" \? \(\s*<>[\s\S]*?\s*<\/div>\s*<\/>\s*\) : rightPanelTab === "staff" \? \(\s*<>\s*<div className="space-y-2">\s*<p className="text-\[9px\] text-slate-400 uppercase font-black tracking-widest px-2">Staff<\/p>)([\s\S]*?)(\s*<\/div>\s*<\/>\s*\) : \()/m;
const match = code.match(regexStaffTab);

if (match) {
  const staffListCode = match[2];
  
  // Create the new staff tab content
  const newStaffTab = `
                  <>
                    <div className="space-y-6">
                      {Object.entries(allRanksInfo)
                        .filter(([_, info]) => info.isStaff || info.priority <= 5)
                        .sort((a, b) => a[1].priority - b[1].priority)
                        .map(([rankKey, info]) => {
                          const onlineStaff = computedUsers.filter(u => u.status !== 'offline' && u.rank === rankKey);
                          const offlineStaff = computedUsers.filter(u => u.status === 'offline' && u.rank === rankKey);
                          if (onlineStaff.length === 0 && offlineStaff.length === 0) return null;
                          return (
                            <div key={rankKey} className="space-y-3">
                              <div className="flex items-center gap-2 px-2">
                                <img src={info.icon} alt={info.name} className="w-4 h-4 object-contain" />
                                <span className="text-[14px] text-white font-extrabold font-display tracking-tight uppercase">{info.name}</span>
                              </div>
                              
                              {onlineStaff.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 px-2">
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Online</span>
                                    <span className="bg-[#0ea5e9] text-white text-[9px] font-bold px-1.5 py-0 rounded-full">{onlineStaff.length}</span>
                                  </div>
                                  {onlineStaff.map((u) => {
                                    const cardGlow = getUserCardStyle(u);
                                    const hasCustomBorder = u.border && u.border !== 'none';
                                    const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                                    const hasCustomStyle = isGlowActive || hasCustomBorder;
                                    
                                    let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                                    if (u.isCurrentUser) {
                                      cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                                    } else {
                                      cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                                    }
                                    if (hasCustomStyle) {
                                      cardClasses += " " + cardGlow.className;
                                    }
                                    return (
                                      <div
                                        key={u.id}
                                        onClick={() => handleProfileClick(u)}
                                        className={cardClasses}
                                        style={hasCustomStyle ? cardGlow.style : undefined}
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="relative">
                                            {activeStories[u.id] ? (
                                              <div 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleProfileClick(u, "view", true);
                                                }}
                                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500 p-[2px] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                              >
                                                <div className="w-full h-full rounded-full border border-[#0a0f1d]">
                                                  <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-full h-full" className="rounded-full" />
                                                </div>
                                              </div>
                                            ) : (
                                              <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className="border border-white/10 bg-slate-850" />
                                            )}
                                            <div className="absolute bottom-0 right-0">
                                              {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                            </div>
                                          </div>
                                          <div className="min-w-0">
                                            <span>
                                              {u.username}
                                              {u.is_muted && <Hand className="w-3 h-3 text-red-500 inline ml-1" title="Muted" />}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block" style={u.cardGlowType === 'terminal' ? { color: '#00ff00' } : undefined}>{u.mood || "No mood set"}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="shrink-0">
                                          {u.cardGlowType === 'terminal' ? (
                                            <span className="text-[8px] border border-[#00ff00] text-[#00ff00] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                              {u.rank}
                                            </span>
                                          ) : (
                                            <img
                                              src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                              alt={u.rank}
                                              className="h-3 w-auto object-contain"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {offlineStaff.length > 0 && (
                                <div className="space-y-2 mt-2">
                                  <div className="flex items-center gap-2 px-2">
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Offline</span>
                                  </div>
                                  {offlineStaff.map((u) => {
                                    const cardGlow = getUserCardStyle(u);
                                    const hasCustomBorder = u.border && u.border !== 'none';
                                    const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                                    const hasCustomStyle = isGlowActive || hasCustomBorder;
                                    
                                    let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                                    if (u.isCurrentUser) {
                                      cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                                    } else {
                                      cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                                    }
                                    if (hasCustomStyle) {
                                      cardClasses += " " + cardGlow.className;
                                    }
                                    return (
                                      <div
                                        key={u.id}
                                        onClick={() => handleProfileClick(u)}
                                        className={cardClasses}
                                        style={hasCustomStyle ? cardGlow.style : undefined}
                                      >
                                        <div className="flex items-center gap-3 min-w-0 opacity-60">
                                          <div className="relative">
                                            {activeStories[u.id] ? (
                                              <div 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleProfileClick(u, "view", true);
                                                }}
                                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500 p-[2px] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                              >
                                                <div className="w-full h-full rounded-full border border-[#0a0f1d]">
                                                  <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-full h-full" className="rounded-full grayscale" />
                                                </div>
                                              </div>
                                            ) : (
                                              <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className="border border-white/10 bg-slate-850 grayscale" />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <span>
                                              {u.username}
                                              {u.is_muted && <Hand className="w-3 h-3 text-red-500 inline ml-1" title="Muted" />}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="shrink-0 opacity-60">
                                          <img
                                            src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                            alt={u.rank}
                                            className="h-3 w-auto object-contain grayscale"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>`;

  const finalReplacement = match[1].replace(/<div className="space-y-2">\s*<p className="text-\[9px\] text-slate-400 uppercase font-black tracking-widest px-2">Staff<\/p>/, newStaffTab) + match[3];

  code = code.replace(match[0], finalReplacement);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Staff tab updated!');
} else {
  console.log('Staff tab not found!');
}
