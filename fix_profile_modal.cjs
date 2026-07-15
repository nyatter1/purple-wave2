const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

// The h2 and h4 headers that display username in ProfileModal
code = code.replace(/<h2 className="text-xs font-black text-white leading-tight">\s*\{targetUser\.username\}\s*<\/h2>/g, 
`<h2 className="text-xs font-black text-white leading-tight flex items-center gap-1 justify-center">
                            {targetUser.username}
                            {targetUser.nameplate && <img src={targetUser.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                          </h2>`);

code = code.replace(/<h4 className="text-purple-400 font-bold text-lg">\{targetUser\.username\}<\/h4>/g, 
`<h4 className="text-purple-400 font-bold text-lg flex items-center gap-1">
                      {targetUser.username}
                      {targetUser.nameplate && <img src={targetUser.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                    </h4>`);

code = code.replace(/<h3 className="text-xl font-black text-red-500 drop-shadow-md tracking-wide mt-0.5 leading-tight">\s*\{targetUser\.username\}\s*<\/h3>/g, 
`<h3 className="text-xl font-black text-red-500 drop-shadow-md tracking-wide mt-0.5 leading-tight flex items-center gap-1">
                                {targetUser.username}
                                {targetUser.nameplate && <img src={targetUser.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                              </h3>`);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
console.log('Replaced ProfileModal nameplates');
