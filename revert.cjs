const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regexRevert = /(\{u\.nameplate && \([\s\S]*?<\/>\s*\)\}\s*<div className="relative z-10 w-full flex items-center justify-between">)([\s\S]*?)(<\/div>\s*<\/div>)/g;

// Wait, the inner had a closing </div> appended to it. So it's </div></div> at the end.
// Let's just find exactly what we inserted.
const toFind = `{u.nameplate && (
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
                              <div className="relative z-10 w-full flex items-center justify-between">`;

let index = code.indexOf(toFind);
while(index !== -1) {
    code = code.substring(0, index) + code.substring(index + toFind.length);
    index = code.indexOf(toFind);
}

// Now we need to remove the extra `</div>` we added.
// The extra `</div>` was added right before the original `closing` (which was `</div>`).
// So we have `</div></div>` where there used to be `</div>`.
// Wait! `regexDiv` matched `(<\/div>)` as `closing`. We appended `\n                              </div>` + `closing`.
// We need to replace `\n                              </div></div>` with `</div>`.
// Let's find exactly the pattern we used.
const toFindEnd = `\n                              </div></div>`;
let indexEnd = code.indexOf(toFindEnd);
while(indexEnd !== -1) {
    code = code.substring(0, indexEnd) + `</div>`;
    indexEnd = code.indexOf(toFindEnd);
}

fs.writeFileSync('src/components/ChatRoom.tsx', code);
