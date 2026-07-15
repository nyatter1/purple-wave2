const fs = require('fs');
let code = fs.readFileSync('src/components/VitroModal.tsx', 'utf8');

const renderBlock = `  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[85vh] min-h-[500px] bg-[#0c1020] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Navigation, Categories & Grid */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 pt-6 pl-6 pr-6 md:pr-0 pb-6 md:pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pr-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-wide uppercase">Vitro Customizer</h2>
                <p className="text-xs font-bold text-slate-400">Personalize your avatar & nameplate</p>
              </div>
            </div>
            
            {/* Mobile close button (only visible on small screens) */}
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex pr-6 mb-4 shrink-0">
            <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl w-full">
              <button 
                onClick={() => setActiveTab('decorations')}
                className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${activeTab === 'decorations' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}\`}
              >
                Decorations
              </button>
              <button 
                onClick={() => setActiveTab('nameplates')}
                className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${activeTab === 'nameplates' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}\`}
              >
                Nameplates
              </button>
            </div>
          </div>

          {activeTab === 'decorations' && (
            <div className="flex flex-col flex-1 min-h-0 pr-6">
              {/* Search & Categories Bar */}
              <div className="flex flex-col gap-3 mb-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium decorations..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-pink-500/50"
                  />
                </div>
                
                {/* Categories tab scroll */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all \${
                        selectedCategory === cat
                          ? "bg-white/20 text-white shadow-sm"
                          : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      }\`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Decorations Grid */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filteredDecorations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                    <p className="text-sm font-bold">No decorations found matching your search.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                      className="mt-2 text-xs text-pink-400 hover:underline font-bold"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 p-0.5">
                    {filteredDecorations.map((item) => {
                      const isCurrentlyPreviewed = previewDecorFilename === item.filename;
                      const isCurrentlyApplied = currentDecorFilename === item.filename;
                      
                      return (
                        <button
                          key={item.filename}
                          onClick={() => setPreviewDecoration(item.filename)}
                          className={\`relative aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group \${
                            isCurrentlyPreviewed
                              ? "bg-pink-500/10 border-2 border-pink-500 shadow-md shadow-pink-500/10"
                              : "bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                          }\`}
                        >
                          {/* Avatar with Overlay Decoration */}
                          <div className="relative mb-2">
                            <Avatar
                              src={user.pfp}
                              alt={item.name}
                              decoration={item.filename}
                              size="lg"
                              className="group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white text-center truncate w-full leading-tight">
                            {item.name}
                          </span>
                          
                          {isCurrentlyApplied && (
                            <div className="absolute top-1.5 right-1.5 bg-green-500/20 text-green-400 p-0.5 rounded-md">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'nameplates' && (
            <div className="flex flex-col flex-1 min-h-0 pr-6">
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 gap-3 p-0.5">
                  {NAMEPLATES.map((item) => {
                    const isCurrentlyPreviewed = previewNameplateFile === item.filename;
                    const isCurrentlyApplied = currentNameplate === item.filename;
                    return (
                      <button
                        key={item.filename}
                        onClick={() => setPreviewNameplate(item.filename)}
                        className={\`relative h-20 rounded-xl flex items-center justify-center overflow-hidden transition-all group \${
                          isCurrentlyPreviewed
                            ? "border-2 border-pink-500 shadow-md shadow-pink-500/10"
                            : "border border-white/5 hover:border-white/10"
                        }\`}
                      >
                        <video 
                          src={item.filename} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10" />
                        
                        <div className="relative z-20 flex items-center gap-3 w-full px-4 justify-between">
                          <span className="font-bold text-white drop-shadow-md text-sm truncate">
                            {item.name}
                          </span>
                          {isCurrentlyApplied && (
                            <div className="bg-green-500 text-white p-1 rounded-md shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Live Preview Pane */}
        <div className="w-full md:w-72 bg-white/[0.02] p-6 flex flex-col justify-between shrink-0 h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-end hidden md:flex mb-6">
              <button 
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Discord Presence Card */}
            <div className="w-full bg-[#111424] rounded-2xl border border-white/5 overflow-hidden shadow-xl p-5 relative">
              {/* Profile Card Banner */}
              <div className="h-16 w-full bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent absolute top-0 left-0" />
              
              {/* Nameplate preview background */}
              {activeTab === 'nameplates' && previewNameplate && (
                <div className="absolute inset-0 z-0 opacity-40">
                  <video 
                    src={previewNameplate} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Showcase Avatar Area */}
              <div className="relative mt-4 flex justify-center z-10">
                <Avatar
                  src={user.pfp}
                  alt={user.username}
                  decoration={activeTab === 'decorations' ? previewDecoration : user.avatar_decoration}
                  size="2xl"
                  className="ring-4 ring-[#111424] bg-slate-900"
                />
              </div>

              {/* User Bio Details */}
              <div className="text-center mt-5 space-y-1 relative z-10">
                <h4 className="text-base font-black text-white leading-tight">{user.username}</h4>
                <p className="text-[10px] text-pink-400 font-bold tracking-wider uppercase">Vitro Preview</p>
                
                <div className="h-px bg-white/5 my-3.5" />
                <p className="text-xs text-slate-400 italic">"{user.mood || 'Adjusting my aesthetics...'}"</p>
              </div>
            </div>

            {/* Item description info */}
            <div className="mt-5 p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase block mb-1">
                Active {activeTab === 'decorations' ? 'Decoration' : 'Nameplate'}
              </span>
              <p className="text-sm font-bold text-white">
                {activeTab === 'decorations' 
                  ? (previewDecoration 
                      ? DECORATIONS.find(d => d.filename === getCleanFilename(previewDecoration))?.name || "Premium Decoration"
                      : "None")
                  : (previewNameplate 
                      ? NAMEPLATES.find(n => n.filename === previewNameplate)?.name || "Premium Nameplate"
                      : "None")
                }
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTab === 'decorations'
                  ? (previewDecoration 
                     ? "An elegant, custom-crafted looping overlay designed to make your profile stand out." 
                     : "Select a decoration from the Vitro gallery to preview it live.")
                  : (previewNameplate
                     ? "An animated background that shows behind your user card in the online players list."
                     : "Select a nameplate to preview it live.")
                }
              </p>
            </div>
            
            {/* Spacer */}
            <div className="flex-1 min-h-[20px]" />
            
            {/* Action buttons footer */}
            <div className="space-y-2 mt-6 shrink-0">
              {(activeTab === 'decorations' ? previewDecoration : previewNameplate) && (
                <button
                  onClick={handleRemove}
                  className="w-full py-2 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove {activeTab === 'decorations' ? 'Decoration' : 'Nameplate'}
                </button>
              )}
              
              <button
                onClick={handleApply}
                disabled={isApplying}
                className={\`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all \${
                  isApplying 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : (activeTab === 'decorations' ? previewDecoration === user.avatar_decoration : previewNameplate === user.nameplate)
                      ? "bg-white/10 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/20 active:scale-95 cursor-pointer"
                }\`}
              >
                {isApplying 
                  ? "Saving..." 
                  : (activeTab === 'decorations' ? previewDecoration === user.avatar_decoration : previewNameplate === user.nameplate)
                    ? "Equipped" 
                    : "Apply"}
                {!isApplying && (activeTab === 'decorations' ? previewDecoration !== user.avatar_decoration : previewNameplate !== user.nameplate) && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const replaceIndex = code.indexOf('  return (\n');
if (replaceIndex !== -1) {
  code = code.substring(0, replaceIndex) + renderBlock;
  fs.writeFileSync('src/components/VitroModal.tsx', code);
  console.log("Successfully replaced render block");
} else {
  console.error("Could not find render block");
}
