/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_WEB_SOCKET_SERVER_PORT:"https://synccode-001786.vercel.app/",
    NEXT_PUBLIC_ORIGIN:"http://localhost:3000",
    NEXT_PUBLIC_ZEGOCLOUD_APP_ID:1843547935,
    NEXT_PUBLIC_ZEGOCLOUD_SERVER:'413a29ab68595d97b9f30beee5bee3fb',
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
