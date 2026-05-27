import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/learningcrypto",
        destination: "https://learningcrypto.com",
        permanent: false,
      },
      {
        source: "/:locale(en|ar|zh|ru)/learningcrypto",
        destination: "https://learningcrypto.com",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
