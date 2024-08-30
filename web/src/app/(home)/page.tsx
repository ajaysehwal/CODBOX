"use client";
import React from "react";
import { motion, Variant, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context";
import { Account } from "@/components/navbar";
import GoogleSignIn from "@/components/navbar/signIn";
import { Logo } from "@/components/logo";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <motion.div variants={fadeInUp}>
    <Card className="bg-white/50 backdrop-blur-sm p-8 h-full rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
      <motion.div
        className="flex flex-col items-center text-center h-full"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
        <h3 className="text-2xl font-semibold mt-6 mb-4 text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
    </Card>
  </motion.div>
);

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md shadow-sm py-4 px-8 sticky top-0 z-10"
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 gap-2">
            <Logo />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              CODBOX
            </span>
          </div>
          {user ? <Account /> : <GoogleSignIn />}
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 py-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.section variants={fadeInUp} className="text-center mb-24">
            <h1 className="text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Elevate Your Development
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Collaborate, code, and innovate seamlessly in one powerful
              platform. Welcome to the future of development with CODBOX.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg px-10 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Link href="/playground">Start Creating</Link>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.section>

          <motion.section
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24"
          >
            <FeatureCard
              icon={<ArrowRight className="h-12 w-12 text-blue-500" />}
              title="Smart Coding"
              description="Experience real-time collaboration with intelligent version control and instant syncing."
            />
            <FeatureCard
              icon={<ArrowRight className="h-12 w-12 text-indigo-500" />}
              title="AI-Powered File Management"
              description="Organize projects effortlessly with AI suggestions and advanced search capabilities."
            />
            <FeatureCard
              icon={<ArrowRight className="h-12 w-12 text-purple-500" />}
              title="Seamless Teamwork"
              description="Streamline your workflow with integrated chat, task management, and code review tools."
            />
          </motion.section>

          <motion.section variants={fadeInUp} className="text-center mb-24">
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Ready to revolutionize your development process?
            </h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 rounded-full transition-all duration-300"
              >
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.section>
        </motion.div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md py-8 text-center text-gray-600">
        <p>&copy; 2024 CODBOX. Empowering developers worldwide.</p>
      </footer>
    </div>
  );
};

export default Home;
