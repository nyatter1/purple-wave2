const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /<div className="absolute bottom-full left-4 mb-3 p-4 bg-\[#0a0f1d\].*?Room Features & Utilities.*?<\/span>.*?<X className="w-3\.5 h-3\.5" \/>.*?<\/button>.*?<\/div>.*?<div className="grid grid-cols-2 gap-2">.*?<\/div>.*?<\/div>/s;

const replacement = `<div className="absolute bottom-full left-4 mb-3 p-2 bg-[#1e2124] border border-[#282b30] rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
                    <button
                      type="button"
                      onClick={() => { setShowProfileVisitorsModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Profile Visitors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPaintModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Paint Canvas"
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowGallerySettingsModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Photo Gallery"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowSecretMessagesListModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Inbox"
                    >
                      <Unlock className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPollModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Room Poll"
                    >
                      <Vote className="w-5 h-5" />
                    </button>
                  </div>`;

if(code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Replaced plus menu');
} else {
  console.log('Plus menu not found');
}
