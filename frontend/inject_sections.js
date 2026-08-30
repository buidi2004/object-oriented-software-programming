const fs = require('fs');
const path = require('path');

const solutions = {
  ecommerce: 'pink',
  gaming: 'purple',
  enterprise: 'slate',
  student: 'amber',
  sme: 'blue',
  agency: 'emerald',
  migration: 'orange',
  security: 'red'
};

for (const [slug, color] of Object.entries(solutions)) {
  const filePath = path.join(__dirname, 'app/solutions', slug, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not exists
    if (!content.includes('SolutionExtendedSections')) {
      content = content.replace(
        "import { TypewriterText } from '@/src/components/animations/TypewriterText';",
        "import { TypewriterText } from '@/src/components/animations/TypewriterText';\nimport { SolutionExtendedSections } from '@/src/components/solutions/SolutionExtendedSections';"
      );
    }
    
    // Append component before last </div>
    if (!content.includes(`<SolutionExtendedSections slug="${slug}"`)) {
      content = content.replace(
        /<\/div>\s*<\/div>\s*\);\s*\}\s*$/,
        `</div>\n\n      <SolutionExtendedSections slug="${slug}" themeColor="${color}" />\n\n    </div>\n  );\n}`
      );
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${slug}`);
    }
  }
}
