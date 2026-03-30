const { execSync } = require('child_process');
try {
  console.log(execSync('git log --oneline -n 5').toString());
  console.log(execSync('git checkout HEAD~1 src/App.tsx src/index.css').toString());
} catch (e) {
  console.error(e.toString());
}
