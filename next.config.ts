import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  sassOptions: {
    includePaths: [path.join(__dirname, "src", "presentation", "styles")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "pub-983997e34f814b8baf6dc4b05ec7dc55.r2.dev",
        port:      "",
        pathname:  "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source:  "/sw.js",
        headers: [
          { key: "Cache-Control",   value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type",    value: "application/javascript" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;