const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const regex = /                      <\/div>\n                    <\/div>\n                  <\/>\n                \)}\n              <\/div>\n            <\/div>\n          <\/>\n        \)}\n      <\/main>/m;

code = code.replace(regex, `                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>`);
// Let's actually replace it correctly. The error is The character "}" is not valid inside a JSX element.
// That means the compiler thinks we are inside a JSX tag, not inside a JS expression.
// Let's trace it.
