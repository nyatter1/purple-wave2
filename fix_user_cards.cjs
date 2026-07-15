const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regexOnlineList = /(let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border ";[\s\S]*?className={cardClasses}[\s\S]*?style={hasCustomStyle \? cardGlow\.style : undefined}[\s\S]*?>)/;

code = code.replace(regexOnlineList, (match) => {
    // We add " relative overflow-hidden group" to cardClasses base
    return match.replace(
        'let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border ";',
        'let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";'
    );
});

fs.writeFileSync('src/components/ChatRoom.tsx', code);
