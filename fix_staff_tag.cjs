const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /\) : rightPanelTab === "staff" \? \(\n                  <>\n                  \n                  <>\n                    <div className="space-y-6">/g;

code = code.replace(regex, `) : rightPanelTab === "staff" ? (
                  <>
                    <div className="space-y-6">`);
fs.writeFileSync('src/components/ChatRoom.tsx', code);
