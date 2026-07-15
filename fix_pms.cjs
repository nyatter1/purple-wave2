const fs = require('fs');
let code = fs.readFileSync('src/components/PrivateMessageSystem.tsx', 'utf8');

const regex = /<span className="font-bold text-sm text-purple-100 truncate max-w-\[120px\]">\{otherUser\.username\}<\/span>/g;
const replacement = `<span className="font-bold text-sm text-purple-100 truncate max-w-[120px] flex items-center gap-1">
            {otherUser.username}
            {otherUser.nameplate && <img src={otherUser.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
          </span>`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/PrivateMessageSystem.tsx', code);
  console.log('Replaced PMS nameplates');
}
