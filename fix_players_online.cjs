const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

code = code.replace(/<span className="text-\[14px\] text-white font-extrabold font-display tracking-tight">Online<\/span>/g, '<span className="text-[14px] text-white font-extrabold font-display tracking-tight">Players Online</span>');

fs.writeFileSync('src/components/ChatRoom.tsx', code);
console.log('Replaced Players Online');
