"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Code, FileText, Users } from "lucide-react";
import { useAuth } from "@/context";
import { Account } from "@/components/navbar";
import GoogleSignIn from "@/components/navbar/signIn";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-blue-900">
      <nav className="bg-white bg-opacity-70 backdrop-blur-md shadow-sm py-4 px-8 sticky top-0 z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto flex justify-between items-center"
        >
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              CODBOX
            </span>
          </div>
          {user ? <Account /> : <GoogleSignIn />}
        </motion.div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.section variants={itemVariants} className="text-center mb-24">
            <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
              Your All-in-One Development Platform
            </h1>
            <p className="text-xl text-blue-600 mb-12 max-w-2xl mx-auto">
              Collaborate, code, and manage files seamlessly in one place.
              Experience the future of development with CODBOX.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-10 py-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link href={"/playground"}>Get Started</Link>

                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.section>

          <motion.section
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24"
          >
            <FeatureCard
              icon={<Code className="h-12 w-12 text-blue-600" />}
              title="Collaborative Coding"
              description="Code together in real-time with your team, leveraging powerful version control and instant syncing."
            />
            <FeatureCard
              icon={<FileText className="h-12 w-12 text-indigo-600" />}
              title="Intelligent File Management"
              description="Organize and share project files effortlessly with AI-powered suggestions and advanced search capabilities."
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-purple-600" />}
              title="Seamless Team Collaboration"
              description="Streamline communication and workflow with integrated chat, task management, and code review tools."
            />
          </motion.section>

          <motion.section variants={itemVariants} className="text-center mb-24">
            <h2 className="text-4xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
              Ready to transform your development process?
            </h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 rounded-full transition-all duration-300"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.section>
        </motion.div>
      </main>

      <footer className="bg-white bg-opacity-70 backdrop-blur-md py-8 text-center text-blue-600">
        <p>&copy; 2024 CODBOX. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-white bg-opacity-50 backdrop-blur-sm p-8 h-full rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col items-center text-center h-full">
          {icon}
          <h3 className="text-2xl font-semibold mt-6 mb-4 text-blue-800">
            {title}
          </h3>
          <p className="text-blue-600">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
}
