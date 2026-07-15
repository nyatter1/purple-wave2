const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /                \)}\n              <\/div>\n            <\/div>\n          <\/>\n        \)}\n      <\/div>/m;
code = code.replace(regex, `                )}
              </div>
            </div>
          </>
        )}
      </main>`);
fs.writeFileSync('src/components/ChatRoom.tsx', code);
