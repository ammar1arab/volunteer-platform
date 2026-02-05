import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "src", "presentation", "styles")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-983997e34f814b8baf6dc4b05ec7dc55.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
