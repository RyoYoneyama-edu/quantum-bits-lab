import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // ↓ ご自身のSupabaseプロジェクトのURLに合わせて変更してください
        // 例: 'xyzproject.supabase.co'
        hostname: 'Quantum Bits Lab.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;