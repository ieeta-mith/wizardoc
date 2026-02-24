import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API traffic is proxied by Nginx to FastAPI; no local rewrite to json-server.
    output: "standalone",
    basePath: "/wizardoc",
};

export default nextConfig;
