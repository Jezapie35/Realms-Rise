const chokidar = require("chokidar");
const { execSync } = require("child_process");

let debounceTimer = null;

function pushToGitHub() {
  try {
    const status = execSync("git status --porcelain", { cwd: __dirname }).toString().trim();
    if (!status) { console.log("✅ Nothing to commit.\n"); return; }
    console.log("📦 Changes detected, pushing...");
    execSync("git add .", { cwd: __dirname, stdio: "inherit" });
    const time = new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
    execSync(`git commit -m "Auto-sync [${time}]"`, { cwd: __dirname, stdio: "inherit" });
    execSync("git push", { cwd: __dirname, stdio: "inherit" });
    console.log("✅ Pushed!\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

console.log("👁️  Watching .ts .tsx .js .json files...\n");

chokidar.watch(["**/*.ts", "**/*.tsx", "**/*.js", "**/*.json"], {
  ignored: ["**/node_modules/**", "**/.git/**"],
  persistent: true,
  ignoreInitial: true,
  cwd: __dirname,
}).on("all", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(pushToGitHub, 2000);
});
