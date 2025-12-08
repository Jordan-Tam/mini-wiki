import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		// Enable polling for Docker for hot reload
		// https://vite.dev/config/server-options#server-watch
		// led to https://github.com/paulmillr/chokidar/tree/3.6.0#api
		watch: {
			usePolling: true
		},
		proxy: {
			"/api": {
				target: process.env.VITE_API_BASE || "http://localhost:3000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, "")
			}
		}
	}
});
