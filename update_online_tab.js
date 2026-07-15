const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regexOnlineTab = /(\{rightPanelTab === "online" \? \(\s*<>\s*<div className="space-y-2">\s*<p className="text-\[9px\] text-slate-400 uppercase font-black tracking-widest px-2">Online<\/p>)([\s\S]*?)(\s*<\/div>\s*<\/>\s*\) : rightPanelTab === "staff" \? \()/m;
const match = code.match(regexOnlineTab);

if (match) {
  const onlineListCode = match[2];
  const newOnlineTab = `{rightPanelTab === "online" ? (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[12px] text-white font-extrabold font-display tracking-tight">Online</span>
                          <span className="bg-[#0ea5e9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{onlineList.length}</span>
                        </div>
${onlineListCode}
                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[12px] text-white font-extrabold font-display tracking-tight">Offline</span>
                        </div>
${onlineListCode.replace(/onlineList/g, 'offlineList')}
                      </div>
                    </div>
                  </>
                ) : rightPanelTab === "staff" ? (`
  code = code.replace(match[0], newOnlineTab);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Online tab updated!');
} else {
  console.log('Online tab not found!');
}
