import { spawn } from "node:child_process";
import { config as loadEnv } from "dotenv";

loadEnv();

const store = process.env.SHOPIFY_STORE_URL;
const password = process.env.SHOPIFY_STORE_PASSWORD;
const protectedMode = process.argv.includes("--protected");

if (!store) {
	console.error("Missing SHOPIFY_STORE_URL");
	process.exit(1);
}

const args = ["theme", "dev", "--store", store];

if (protectedMode) {
	if (!password) {
		console.error("Missing SHOPIFY_STORE_PASSWORD");
		process.exit(1);
	}

	args.push("--store-password", password);
}

const child = spawn("shopify", args, {
	stdio: "inherit",
	shell: false,
});

child.on("exit", (code) => process.exit(code ?? 1));
