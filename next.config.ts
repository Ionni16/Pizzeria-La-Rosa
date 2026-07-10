import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // Evita /_next/image e carica le foto direttamente da Supabase
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "somnrwbsulrjnfaoimifi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;