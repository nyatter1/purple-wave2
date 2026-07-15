const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

code = code.replace(/avatar_decoration: p\.avatar_decoration \|\| ""/g, 'avatar_decoration: p.avatar_decoration || "",\n          nameplate: p.nameplate || ""');
code = code.replace(/profiles\(username, pfp, rank, username_color, message_color, avatar_decoration\)/g, 'profiles(username, pfp, rank, username_color, message_color, avatar_decoration, nameplate)');
code = code.replace(/avatar_decoration: m\.profiles\?\.avatar_decoration/g, 'avatar_decoration: m.profiles?.avatar_decoration,\n          nameplate: m.profiles?.nameplate');
code = code.replace(/select\('username, pfp, rank, username_color, message_color, avatar_decoration'\)/g, 'select(\'username, pfp, rank, username_color, message_color, avatar_decoration, nameplate\')');
code = code.replace(/avatar_decoration: profileData\?\.avatar_decoration/g, 'avatar_decoration: profileData?.avatar_decoration,\n      nameplate: profileData?.nameplate');
code = code.replace(/avatar_decoration: p\.avatar_decoration \|\| "",/g, 'avatar_decoration: p.avatar_decoration || "",\n      nameplate: p.nameplate || "",');

code = code.replace(/avatar_decoration: payload\.new\.avatar_decoration !== undefined \? payload\.new\.avatar_decoration : u\.avatar_decoration/g, 'avatar_decoration: payload.new.avatar_decoration !== undefined ? payload.new.avatar_decoration : u.avatar_decoration,\n                nameplate: payload.new.nameplate !== undefined ? payload.new.nameplate : u.nameplate');
code = code.replace(/avatar_decoration: payload\.new\.avatar_decoration !== undefined \? payload\.new\.avatar_decoration : user\.avatar_decoration/g, 'avatar_decoration: payload.new.avatar_decoration !== undefined ? payload.new.avatar_decoration : user.avatar_decoration,\n              nameplate: payload.new.nameplate !== undefined ? payload.new.nameplate : user.nameplate');
code = code.replace(/avatar_decoration: payload\.new\.avatar_decoration !== undefined \? payload\.new\.avatar_decoration : prev\.avatar_decoration/g, 'avatar_decoration: payload.new.avatar_decoration !== undefined ? payload.new.avatar_decoration : prev.avatar_decoration,\n                nameplate: payload.new.nameplate !== undefined ? payload.new.nameplate : prev.nameplate');

fs.writeFileSync('src/components/ChatRoom.tsx', code);
