import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Type errors now fail the build — do not silently ship them.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Catch impure effects / double-invocation bugs early in dev.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.ui.com", pathname: "/microsite/static/**" },
      // Cloudinary image delivery
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  // Redirect /home → / (safety net for nav data that may store "home" as href)
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: false,
      },
    ];
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
