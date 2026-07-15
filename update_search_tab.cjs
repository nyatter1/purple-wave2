const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const targetStr = `) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest px-2">Friends</p>`;
                      
if (code.includes(targetStr)) {
  const replacement = `) : rightPanelTab === "search" ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest px-2">Search Results</p>
                      {searchQuery.trim() === "" ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                          <Search className="w-5 h-5 text-slate-600 mb-2" />
                          <p className="text-xs text-slate-400 font-bold">Type to search</p>
                        </div>
                      ) : (
                        computedUsers
                          .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((u) => {
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
                                    <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className={\`border border-white/10 bg-slate-850 \${u.status === 'offline' ? 'grayscale' : ''}\`} />
                                    <div className="absolute bottom-0 right-0">
                                      {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <span>
                                      {u.username}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <img
                                    src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                    alt={u.rank}
                                    className={\`h-3 w-auto object-contain \${u.status === 'offline' ? 'grayscale' : ''}\`}
                                  />
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </>
                ) : (` + `
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[14px] text-white font-extrabold font-display tracking-tight">Friends</span>
                        </div>`;
  
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Search tab updated!');
} else {
  console.log('Target string not found!');
}
