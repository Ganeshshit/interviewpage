import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Code, Users, Video, Sparkles } from "lucide-react";

// Custom Button Component
const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 hover:scale-105 shadow-lg hover:shadow-indigo-200/50 rounded-lg",
    outline: "border-2 border-indigo-200 bg-white/90 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 hover:scale-105 shadow-lg hover:shadow-indigo-100/50 backdrop-blur-sm",
  };
  
  const sizeStyles = {
    default: "h-11 px-5 py-2",
    lg: "h-14 px-8 py-4 text-lg",
  };
  
  return (
    <motion.button 
      className={`rounded-lg ${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Custom Card Components
const Card = ({ children, className = "", ...props }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border border-indigo-100 bg-white/70 backdrop-blur-xl text-gray-900 shadow-xl hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Link component (simplified version without Next.js router)
const Link = ({ href, children, className = "", ...props }) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-indigo-100/30 to-violet-100/30 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-t from-violet-100/30 to-indigo-100/30 blur-3xl" />
      </div>
      <div className="relative z-10">
        <header className="border-b border-indigo-100/20 bg-white/70 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <Video className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text tracking-tight">InterviewPro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="hover:bg-indigo-50/50">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-lg hover:shadow-indigo-200/50">Sign up</Button>
              </Link>
            </div>
          </motion.div>
        </header>

        <main>
          <section className="container mx-auto px-4 py-32 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8">
              <div className="relative">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text relative z-10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, type: "spring", stiffness: 100 }}>
                  <motion.span 
                    className="inline-block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}>
                    Streamline
                  </motion.span>{" "}
                  <motion.span 
                    className="inline-block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}>
                    Your
                  </motion.span>{" "}
                  <motion.span 
                    className="inline-block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}>
                    Technical
                  </motion.span>{" "}
                  <motion.span 
                    className="inline-block"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}>
                    Interviews
                  </motion.span>
                </motion.h1>
                <motion.div
                  className="absolute inset-0 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 blur-3xl" />
                </motion.div>
              </div>
              
              <motion.p 
                className="text-xl text-indigo-600/70 max-w-3xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1 }}>
                A comprehensive platform for conducting seamless technical interviews with integrated video calls and live
                coding environments.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}>
                <Link href="/register?role=candidate">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25">
                      Join as Candidate <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register?role=interviewer">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="gap-2 border-2 border-indigo-600/20 hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                      Join as Interviewer <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </section>

        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12">
            <motion.div className="relative mb-12">
              <motion.h2 
                className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}>
                Key Features
              </motion.h2>
              <motion.div 
                className="absolute inset-0 -z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              </motion.div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Video className="h-10 w-10 text-indigo-600 mb-2" />
                  <CardTitle>Real-time Video Interviews</CardTitle>
                  <CardDescription>
                    High-quality, low-latency video and audio communication for seamless interviews.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Our platform uses WebRTC technology to provide stable and secure video connections, ensuring a smooth
                    interview experience for both candidates and interviewers.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Code className="h-10 w-10 text-indigo-600 mb-2" />
                  <CardTitle>Live Coding Environment</CardTitle>
                  <CardDescription>
                    Integrated code editor with syntax highlighting and real-time execution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Evaluate technical skills effectively with our Monaco Editor integration, supporting multiple
                    programming languages and providing real-time code execution.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-indigo-600 mb-2" />
                  <CardTitle>Smart Scheduling</CardTitle>
                  <CardDescription>Intuitive calendar integration for managing interview appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Easily set availability as an interviewer or book time slots as a candidate with our visual calendar
                    system, eliminating scheduling conflicts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </section>

        <section className="bg-gradient-to-b from-indigo-50 to-white py-24">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-4">
            <motion.div className="relative mb-16">
              <motion.h2 
                className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}>
                How It Works
              </motion.h2>
              <motion.div 
                className="absolute inset-0 -z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              </motion.div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center">
                <motion.div 
                  className="bg-gradient-to-br from-indigo-100 to-violet-100 h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}>
                  <Users className="h-10 w-10 text-indigo-600" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-3 text-gray-900"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}>
                  1. Create an Account
                </motion.h3>
                <motion.p 
                  className="text-indigo-600/70"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}>
                  Sign up as a candidate, interviewer, or administrator and set up your profile.
                </motion.p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center">
                <motion.div 
                  className="bg-gradient-to-br from-indigo-100 to-violet-100 h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}>
                  <Calendar className="h-10 w-10 text-indigo-600" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-3 text-gray-900"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}>
                  2. Schedule Interviews
                </motion.h3>
                <motion.p 
                  className="text-indigo-600/70"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}>
                  Interviewers set availability, and candidates book preferred time slots.
                </motion.p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col items-center">
                <motion.div 
                  className="bg-gradient-to-br from-indigo-100 to-violet-100 h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}>
                  <Video className="h-10 w-10 text-indigo-600" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-3 text-gray-900"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}>
                  3. Conduct Interviews
                </motion.h3>
                <motion.p 
                  className="text-indigo-600/70"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}>
                  Join the interview room with video, audio, and live coding capabilities.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </section>
        </main>
      </div>

      <footer className="bg-gradient-to-b from-indigo-900 to-violet-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-6 w-6 text-white" />
                <span className="text-xl font-bold">InterviewPro</span>
              </div>
              <p className="text-slate-400">Streamlining technical interviews with cutting-edge technology.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-slate-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="text-slate-400 hover:text-white transition-colors">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-slate-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} InterviewPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}