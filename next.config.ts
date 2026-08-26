import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (embedded Postgres used in local development) ships WASM assets that
  // must not be bundled by webpack/turbopack on the server.
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
