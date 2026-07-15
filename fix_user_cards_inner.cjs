const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regexDiv = /(<div\s+key=\{u\.id\}\s+onClick=\{[^}]+\}\s+className=\{cardClasses\}\s+style=\{hasCustomStyle \? cardGlow\.style : undefined\}\s*>)\s*(<div className="flex items-center gap-3 min-w-0">[\s\S]*?<\/div>\s*<div className="shrink-0">[\s\S]*?<\/div>)\s*(<\/div>)/g;

code = code.replace(regexDiv, (match, opening, inner, closing) => {
    return opening + `
                              {u.nameplate && (
                                <>
                                  <video 
                                    src={u.nameplate} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 z-0 pointer-events-none"
                                  />
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-0 pointer-events-none" />
                                </>
                              )}
                              <div className="relative z-10 w-full flex items-center justify-between">
` + inner + `
                              </div>` + closing;
});

fs.writeFileSync('src/components/ChatRoom.tsx', code);
