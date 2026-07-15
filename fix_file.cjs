const fs = require('fs');
let code = fs.readFileSync('src/components/VitroModal.tsx', 'utf8');
code = code.replace(/%28/g, '(').replace(/%29/g, ')');
fs.writeFileSync('src/components/VitroModal.tsx', code);
