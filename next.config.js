/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/utils',
    '@mui/icons-material'
  ],
  experimental: {
    esmExternals: false
  }
};

module.exports = nextConfig; 