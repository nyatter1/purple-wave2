const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /<h3 className="font-bold text-white text-sm">\{staff\.username\}<\/h3>/g;
const replacement = `<h3 className="font-bold text-white text-sm flex items-center gap-1">
                        {staff.username}
                        {staff.nameplate && <img src={staff.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                      </h3>`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Replaced staff tab nameplates');
}
