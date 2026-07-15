const fs = require('fs');
let code = fs.readFileSync('src/components/VitroModal.tsx', 'utf8');

code = code.replace(/const \[selectedCategory, setSelectedCategory\] = useState<string>\("All"\);/g, `const [activeTab, setActiveTab] = useState<'decorations' | 'nameplates'>('decorations');
  const [selectedCategory, setSelectedCategory] = useState<string>("All");`);

code = code.replace(/const \[previewDecoration, setPreviewDecoration\] = useState<string \| null>\(user\.avatar_decoration \|\| null\);/g, `const [previewDecoration, setPreviewDecoration] = useState<string | null>(user.avatar_decoration || null);
  const [previewNameplate, setPreviewNameplate] = useState<string | null>(user.nameplate || null);`);

code = code.replace(/const previewDecorFilename = getCleanFilename\(previewDecoration\);/g, `const previewDecorFilename = getCleanFilename(previewDecoration);
  const currentNameplate = user.nameplate;
  const previewNameplateFile = previewNameplate;`);

code = code.replace(/const handleApply = async \(\) => {/g, `const handleApply = async () => {
    setIsApplying(true);
    try {
      if (activeTab === 'nameplates') {
        const { error } = await supabase
          .from('profiles')
          .update({ nameplate: previewNameplate })
          .eq('id', user.id);
        if (error) throw error;
        onUpdateUser({ nameplate: previewNameplate || "" });
        alert("Successfully applied your new Vitro Nameplate!");
        onClose();
        return;
      }`);

code = code.replace(/const handleRemove = \(\) => {/g, `const handleRemove = () => {
    if (activeTab === 'nameplates') {
      setPreviewNameplate(null);
      return;
    }`);

// For rendering Tabs
code = code.replace(/<div className="flex gap-2 p-4 pt-0 overflow-x-auto no-scrollbar">/, `<div className="flex px-4 mb-2">
            <div className="flex p-1 bg-black/40 rounded-xl w-full">
              <button 
                onClick={() => setActiveTab('decorations')}
                className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${activeTab === 'decorations' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-400 hover:text-white'}\`}
              >
                Decorations
              </button>
              <button 
                onClick={() => setActiveTab('nameplates')}
                className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${activeTab === 'nameplates' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-400 hover:text-white'}\`}
              >
                Nameplates
              </button>
            </div>
          </div>
          {activeTab === 'decorations' && <div className="flex gap-2 p-4 pt-0 overflow-x-auto no-scrollbar">`);

fs.writeFileSync('src/components/VitroModal.tsx', code);
