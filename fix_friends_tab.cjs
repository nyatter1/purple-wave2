const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /<span className="text-\[14px\] text-white font-extrabold font-display tracking-tight">Friends<\/span>\s*<\/div>\s*<div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white\/5 rounded-xl bg-white\/\[0\.01\]">/m;

if (code.match(regex)) {
  const replacement = `<span className="text-[14px] text-white font-extrabold font-display tracking-tight">Friends</span>
                        </div>
                      {friendsProfiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                          <Heart className="w-5 h-5 text-slate-600 mb-2" />
                          <p className="text-xs text-slate-400 font-bold">No friends added</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">Add friends from their profile to see them here.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {friendsProfiles.map((u) => {
                            const isOnline = onlineUserIds.has(u.id);
                            const displayStatus = isOnline ? (u.custom_status === 'invisible' ? 'offline' : (u.custom_status || 'online')) : 'offline';
                            
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
                                <div className={\`flex items-center gap-3 min-w-0 \${displayStatus === 'offline' ? 'opacity-60' : ''}\`}>
                                  <div className="relative">
                                    <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className={\`border border-white/10 bg-slate-850 \${displayStatus === 'offline' ? 'grayscale' : ''}\`} />
                                    <div className="absolute bottom-0 right-0">
                                      {renderStatusBadge(displayStatus, "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
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
                                <div className={\`shrink-0 \${displayStatus === 'offline' ? 'opacity-60' : ''}\`}>
                                  <img
                                    src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                    alt={u.rank}
                                    className={\`h-3 w-auto object-contain \${displayStatus === 'offline' ? 'grayscale' : ''}\`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      </div>
                    </div>
                  </>
                )
              }
            </div>
          </>
        )}
      </main>
`;
  
  // Need to be careful about matching just enough to replace properly.
  // Actually, wait, let's just use string replace.
  code = code.replace(/<span className="text-\[14px\] text-white font-extrabold font-display tracking-tight">Friends<\/span>\s*<\/div>\s*<div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white\/5 rounded-xl bg-white\/\[0\.01\]">\s*<Heart className="w-5 h-5 text-slate-600 mb-2" \/>\s*<p className="text-xs text-slate-400 font-bold">No friends online<\/p>\s*<p className="text-\[10px\] text-slate-500 mt-1 max-w-\[180px\]">Add friends from their profile to see them here\.<\/p>\s*<\/div>\s*<\/div>/, replacement);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Friends tab updated!');
} else {
  console.log('Target string not found!');
}
