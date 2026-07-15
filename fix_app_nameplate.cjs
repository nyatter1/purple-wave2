const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/avatar_decoration: data\.avatar_decoration \|\| ""/g, 'avatar_decoration: data.avatar_decoration || "",\n        nameplate: data.nameplate || ""');
code = code.replace(/if \('avatar_decoration' in updatedUser\) dbUpdate\.avatar_decoration = updatedUser\.avatar_decoration;/g, "if ('avatar_decoration' in updatedUser) dbUpdate.avatar_decoration = updatedUser.avatar_decoration;\n    if ('nameplate' in updatedUser) dbUpdate.nameplate = updatedUser.nameplate;");
fs.writeFileSync('src/App.tsx', code);
