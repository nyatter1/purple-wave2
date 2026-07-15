const fs = require('fs');
let code = fs.readFileSync('src/components/ChatRoom.tsx', 'utf8');

const target = `                      )}
                      </div>
                    </div>
                  </>
                )
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>`;

if (code.includes(target)) {
  code = code.replace(target, `                      )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>`);
  fs.writeFileSync('src/components/ChatRoom.tsx', code);
  console.log('Fixed tags');
} else {
  console.log('Target not found');
}
