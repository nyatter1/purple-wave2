const fs = require('fs');
let code = fs.readFileSync('src/components/VitroModal.tsx', 'utf8');

const regex = /<h4 className="text-base font-black text-white leading-tight">\{user\.username\}<\/h4>/;

const replacement = `<h4 className="text-base font-black text-white leading-tight flex items-center justify-center gap-1">
                  {user.username}
                  {user.nameplate && <img src={user.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                </h4>`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/VitroModal.tsx', code);
  console.log('Replaced VitroModal nameplate');
}
