const fs = require('fs');
let content = fs.readFileSync('src/components/VitroModal.tsx', 'utf8');

const regex = /\{ name: "([^"]+)", filename: "([^"]+)", category: "([^"]+)" \}/g;
content = content.replace(regex, (match, name, filename, category) => {
    // Convert underscores back to spaces to match github repo filenames
    let newFilename = filename.replace(/_/g, ' ');
    // Exceptions like "Dog Brown & White.gif" from "Dog_Brown_&_White.gif" is correct
    // "Cherry Blossom (Dark Pink).gif" from "Cherry_Blossom_Dark_Pink.gif" wait, github repo says "Cherry Blossom Dark Pink.gif" without parenthesis
    // Let's just use the exact names from the github image:
    if (newFilename === "Cherry Blossom Dark Pink.gif" || filename === "Cherry_Blossom_Dark_Pink.gif") newFilename = "Cherry Blossom Dark Pink.gif";
    if (filename === "Cherry_Blossom_Green.gif") newFilename = "Cherry Blossom Green.gif";
    if (filename === "Cherry_Blossom_Soft_Pink.gif") newFilename = "Cherry Blossom Soft Pink.gif";
    if (filename === "Cherry_Blossom_Yellow.gif") newFilename = "Cherry Blossom Yellow.gif";
    
    // "Gear Spin (Pink & Blue Flames, Green Stars).gif" from "Gear_Spin_(Pink_&_Blue_Flames,_Green_Stars).gif"
    
    return `{ name: "${name}", filename: "https://raw.githubusercontent.com/nyatter1/nitro/main/${encodeURIComponent(newFilename)}", category: "${category}" }`;
});

// Update the setPreviewDecoration logic to just use the URL
content = content.replace(/setPreviewDecoration\(\`\/\$\{item.filename\}\`\)/g, "setPreviewDecoration(item.filename)");
content = content.replace(/decoration=\{\`\/\$\{item.filename\}\`\}/g, "decoration={item.filename}");
// Change handleApply logic
content = content.replace(/const decorationValue = previewDecoration \? \`\/\$\{getCleanFilename\(previewDecoration\)\}\` : null;/g, "const decorationValue = previewDecoration;");

fs.writeFileSync('src/components/VitroModal.tsx', content);
