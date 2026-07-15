const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /                  <\/>\n                \)\n\n                  <\/>\n                \)}\n              <\/div>\n            <\/div>\n          <\/>\n        \)}\n\n      <\/div>/m;

code = code.replace(regex, `                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>`);
fs.writeFileSync('src/components/ChatRoom.tsx', code);
