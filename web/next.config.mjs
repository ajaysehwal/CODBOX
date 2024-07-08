/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_WEB_SOCKET_SERVER_PORT:"http://localhost:8000",
    NEXT_PUBLIC_ORIGIN:"http://localhost:3000",
    HTTP_SERVER_PORT:"http://localhost:8000",
    NEXT_PUBLIC_ZEGOCLOUD_APP_ID:1843547935,
    NEXT_PUBLIC_ZEGOCLOUD_SERVER:'413a29ab68595d97b9f30beee5bee3fb',
    NEXT_PUBLIC_SUPABASE_URL: "https://ohrnvqetrsaqpgouqahd.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocm52cWV0cnNhcXBnb3VxYWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4MTQ0NDksImV4cCI6MjAzNTM5MDQ0OX0.CgasR2mWT9qcuOp5nfDx8BFuDNsL0I9JGxW6bEY4zMQ",
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
