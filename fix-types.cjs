const fs = require('fs');
const content = fs.readFileSync('src/types/database.ts', 'utf-8');

// Find every block that looks like:
//        Update: {
//          ...
//        }
//      }
// and replace with:
//        Update: {
//          ...
//        }
//        Relationships: any[]
//      }

const fixed = content.replace(/(\s+Update:\s*\{[^}]*\})(\s+\}\n\s+(?:[a-zA-Z_]+:\s*\{|Views:))/g, '$1\n        Relationships: any[]$2');

// Wait, the regex might fail if `Update: {` contains nested objects. But `database.ts` doesn't have nested objects in Update.
// A simpler regex:
const safer = content.replace(/(\n        Update: {[^}]*})/g, '$1\n        Relationships: any[]');

fs.writeFileSync('src/types/database.ts', safer);
console.log('Fixed');
