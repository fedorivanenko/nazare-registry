import { spawn } from "node:child_process";
import fsSync from "node:fs";

const stylesDir = "styles";
let child = null;
let restartTimer = null;
let stopping = false;

start();
watchStyleEntries();

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));

function start() {
	child = spawn("vite", ["build", "--watch", "--emptyOutDir=false"], {
		stdio: "inherit",
		shell: process.platform === "win32",
	});

	child.on("exit", (code, signal) => {
		child = null;
		if (stopping) process.exit(code ?? signalToCode(signal) ?? 0);
	});
}

function watchStyleEntries() {
	if (!fsSync.existsSync(stylesDir)) return;

	fsSync.watch(stylesDir, (eventType, filename) => {
		if (eventType !== "rename" || !filename?.endsWith(".css")) return;
		scheduleRestart();
	});
}

function scheduleRestart() {
	clearTimeout(restartTimer);
	restartTimer = setTimeout(restart, 150);
}

function restart() {
	console.log("\nstyles entries changed. restarting Vite watch...\n");
	if (!child) {
		start();
		return;
	}

	const oldChild = child;
	oldChild.once("exit", start);
	oldChild.kill("SIGTERM");
}

function shutdown(code) {
	stopping = true;
	if (!child) process.exit(code);
	child.kill("SIGTERM");
}

function signalToCode(signal) {
	if (signal === "SIGINT") return 130;
	if (signal === "SIGTERM") return 143;
	return null;
}
