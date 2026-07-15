const fs = require('fs');
let content = fs.readFileSync('src/components/Avatar.tsx', 'utf8');

const regex = /if \(decorationUrl\.startsWith\('http'\)\) \{[\s\S]*?\} else \{[\s\S]*?if \(!decorationUrl\.startsWith\('\/'\)\) \{[\s\S]*?decorationUrl = \`\/\$\{decorationUrl\}\`\;[\s\S]*?\}[\s\S]*?\}/;

const replacement = `if (decorationUrl.startsWith('http')) {
      // It's already a full URL, do nothing
    } else {
      // It's an old path, let's map it to the new Github URL
      let filename = decorationUrl.split('/').pop() || decorationUrl;
      filename = filename.replace(/_/g, ' ');
      
      // Handle exceptions where the old filename doesn't perfectly map to the new Github filename spaces
      if (filename === "Cherry Blossom Dark Pink.gif" && !filename.includes('(')) {
        // We just let it be
      }
      
      decorationUrl = \`https://raw.githubusercontent.com/nyatter1/nitro./main/\${encodeURIComponent(filename)}\`;
      
      // Specifically fix the parenthesis issues in the encode
      decorationUrl = decorationUrl.replace(/\\(/g, '%28').replace(/\\)/g, '%29');
    }`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/Avatar.tsx', content);
