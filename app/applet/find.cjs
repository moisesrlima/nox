const fs = require('fs');
const path = require('path');

function findFile(dir, filename) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findFile(fullPath, filename);
        } else if (file === filename) {
          console.log(fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

findFile('/', 'overview.txt');
