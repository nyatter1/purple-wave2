const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');
code = code.replace(/<\/div>\s*<\/>\s*<\/div>\s*<\/>/g, '</div>\n                  </>');
fs.writeFileSync('src/components/ChatRoom.tsx', code);
