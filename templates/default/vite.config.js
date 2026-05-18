import fsSync from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

function sectionStyleInputs() {
	const stylesDir = "styles";

	if (!fsSync.existsSync(stylesDir)) {
		return {};
	}

	return Object.fromEntries(
		fsSync
			.readdirSync(stylesDir)
			.filter((file) => file.endsWith(".css") && file !== "base.css")
			.map((file) => [path.basename(file, ".css"), path.join(stylesDir, file)]),
	);
}

export default defineConfig({
	plugins: [tailwindcss()],
	build: {
		outDir: "assets",
		assetsDir: "",
		emptyOutDir: false,
		manifest: false,
		minify: "esbuild",
		rollupOptions: {
			input: {
				base: "styles/base.css",
				...sectionStyleInputs(),
				theme: "scripts/theme.js",
			},
			output: {
				entryFileNames: "[name].js",
				assetFileNames: "[name][extname]",
			},
		},
	},
});
