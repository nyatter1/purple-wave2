const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

code = code.replace(/(\s*)\)}<\/div>/g, "$1)}\n                              </div>\n                            </div>");

fs.writeFileSync('src/components/ChatRoom.tsx', code);
