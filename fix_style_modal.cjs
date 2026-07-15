const fs = require('fs');
let code = fs.readFileSync('src/components/StyleModal.tsx', 'utf8');

const regex = /<span className="text-sm font-bold"\s+style=\{\{ color: activeTab === 'username' \? usernameColor : user\.username_color \}\}\s*>\s*\{user\.username\}\s*<\/span>/m;

const replacement = `<span className="text-sm font-bold flex items-center gap-1"
                style={{ color: activeTab === 'username' ? usernameColor : user.username_color }}
              >
                {user.username}
                {user.nameplate && <img src={user.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
              </span>`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/StyleModal.tsx', code);
  console.log('Replaced StyleModal nameplate');
} else {
  console.log('Regex did not match StyleModal');
}
