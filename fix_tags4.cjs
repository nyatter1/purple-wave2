const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const target = `)
                  </>
                )}
              </div>`;

if (code.includes(target)) {
  code = code.replace(target, `)}
              </div>`);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Fixed tags');
} else {
  console.log('Target not found');
}
