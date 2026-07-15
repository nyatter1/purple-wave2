const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /(<span\s+onClick=\{\(\) => \{\s+const foundUser = computedUsers\.find\(u => \(msg\.profile_id && u\.id === msg\.profile_id\) \|\| u\.username === msg\.username\);\s+if \(foundUser\) handleProfileClick\(foundUser\);\s+\}\}\s+className=\{`text-sm font-bold hover:underline cursor-pointer transition-colors text-white `\}\s+style=\{\{ color: getMessageStyle\(msg, 'username'\)\.color \}\}\s+>\s+\{msg\.username\}\s+<\/span>)/m;

const replacement = `$1
                              {msg.nameplate && (
                                <img
                                  src={msg.nameplate}
                                  alt="Nameplate"
                                  className="h-4 object-contain shrink-0 ml-1"
                                  referrerPolicy="no-referrer"
                                />
                              )}`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Replaced msg nameplate');
} else {
  console.log('Regex did not match!');
}
