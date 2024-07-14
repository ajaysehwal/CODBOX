/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyAgi3Toh4i8WYqOJKHRUXybPGPu5nYiMpg",
    NEXT_PUBLIC_FIREBASE_AUTHDOMAIN: "codexf-49485.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "codexf-49485",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "codexf-49485.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "192462155746",
    NEXT_PUBLIC_FIREBASE_API_ID: "1:192462155746:web:acc5a7e299aa0f8e9493bb",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-1P928C258S",
    // "NEXT_PUBLIC_WEB_SOCKET_SERVER_PORT":"https://bt-1-0.onrender.com",
    NEXT_PUBLIC_WEB_SOCKET_SERVER_PORT: "http://localhost:8000",
    NEXT_PUBLIC_ORIGIN: "http://localhost:3000",
    NEXT_PUBLIC_ZEGOCLOUD_APP_ID: "1843547935",
    NEXT_PUBLIC_ZEGOCLOUD_SERVER: "413a29ab68595d97b9f30beee5bee3fb",
  },
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "images.unsplash.com"],
  },
};

export default nextConfig;
