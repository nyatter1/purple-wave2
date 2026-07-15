const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

// Replace 1: Online tab
code = code.replace(/<span\s*>\s*\{u\.username\}\s*\{u\.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" \/>\}\s*<\/span>/g, 
`<span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={hasCustomStyle ? { color: cardGlow.style?.color } : { color: u.username_color }}>
                                    {u.username}
                                    {u.nameplate && <img src={u.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                                    {u.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" />}
                                  </span>`);

// Replace 2: Staff tab
code = code.replace(/<span>\s*\{u\.username\}\s*\{u\.is_muted && <Hand className="w-3 h-3 text-red-500 inline ml-1" title="Muted" \/>\}\s*<\/span>/g, 
`<span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={hasCustomStyle ? { color: cardGlow.style?.color } : { color: u.username_color }}>
                                              {u.username}
                                              {u.nameplate && <img src={u.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                                              {u.is_muted && <Hand className="w-3 h-3 text-red-500 inline" title="Muted" />}
                                            </span>`);

// Replace 3: Search and Friends tab
code = code.replace(/<span>\s*\{u\.username\}\s*<\/span>/g, 
`<span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={{ color: u.username_color }}>
                                      {u.username}
                                      {u.nameplate && <img src={u.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                                    </span>`);

fs.writeFileSync('src/components/ChatRoom.tsx', code);
console.log('Spans replaced');
