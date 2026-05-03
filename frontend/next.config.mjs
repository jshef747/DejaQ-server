import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Files in DejaQ-server/chat/ live outside this project root and would
    // normally fail to resolve npm packages (react, next/link, etc.) because
    // webpack walks up from the source file's directory and never reaches
    // frontend/node_modules. Prepending the project-local node_modules path
    // fixes that without affecting normal resolution for files inside frontend/.
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...config.resolve.modules,
    ];
    return config;
  },
};

export default nextConfig;
