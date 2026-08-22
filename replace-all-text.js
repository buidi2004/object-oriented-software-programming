const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./frontend/src').concat(walk('./frontend/app'));
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace light blue/cyan text (used on dark backgrounds)
    content = content.replace(/\btext-(?:blue|cyan|indigo|sky)-(?:50|100|200|300|400)\b/g, 'text-slate-200');
    content = content.replace(/\bhover:text-(?:blue|cyan|indigo|sky)-(?:50|100|200|300|400)\b/g, 'hover:text-white');
    
    // Replace dark blue/cyan text (used on light backgrounds)
    content = content.replace(/\btext-(?:blue|cyan|indigo|sky)-(?:500|600|700|800|900|950)\b/g, 'text-[#1F1F1F]');
    content = content.replace(/\bhover:text-(?:blue|cyan|indigo|sky)-(?:500|600|700|800|900|950)\b/g, 'hover:text-black');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Modified ${modifiedCount} files.`);
