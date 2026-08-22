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
    
    // Replace standard text blue colors
    content = content.replace(/\btext-blue-500\b/g, 'text-[#1F1F1F]');
    content = content.replace(/\btext-blue-600\b/g, 'text-[#1F1F1F]');
    content = content.replace(/\btext-blue-700\b/g, 'text-[#1F1F1F]');
    
    // Replace hover text blue
    content = content.replace(/\bhover:text-blue-500\b/g, 'hover:text-black');
    content = content.replace(/\bhover:text-blue-600\b/g, 'hover:text-black');
    content = content.replace(/\bhover:text-blue-700\b/g, 'hover:text-black');

    // Also replace cyan which was used similarly
    content = content.replace(/\btext-cyan-400\b/g, 'text-[#1F1F1F]');
    content = content.replace(/\btext-cyan-500\b/g, 'text-[#1F1F1F]');
    content = content.replace(/\btext-cyan-600\b/g, 'text-[#1F1F1F]');
    content = content.replace(/\bhover:text-cyan-500\b/g, 'hover:text-black');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Modified ${modifiedCount} files.`);
