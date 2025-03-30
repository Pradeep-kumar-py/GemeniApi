import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const { isSignedIn } = useUser();
    const navigate = useNavigate();
    const {user} = useUser()
    console.log("User",user)

    useEffect(() => {
        if (isSignedIn) {
            navigate("/dashboard"); // Redirect if not signed in
        }
    }, [isSignedIn, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationComplete(true);
        }, 2000); // Animation completion time

        return () => clearTimeout(timer);
    }, []);
    const UserProfile = () => {
        return (
            <div className="flex items-center justify-center  rounded-full ">
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-slate-800 p-4">
            <div className="relative w-full h-screen flex flex-col items-center justify-center">
                {/* Logo and Name Animation */}
                <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                    }}
                >
                    {/* Replace with your actual logo */}
                    <motion.div
                        className="w-32 h-32 md:w-40 md:h-40 mb-6 bg-blue-500 rounded-full flex items-center justify-center text-white"
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-4xl md:text-5xl font-bold"><img src="/p11.svg" alt="" /></span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6 text-center text-slate-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        Blue Bricks Remote HR
                    </motion.h1>
                </motion.div>

                {/* Tagline and Button Section */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                        opacity: animationComplete ? 1 : 0,
                        y: animationComplete ? 0 : 50
                    }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-xl md:text-2xl text-slate-600 mb-8">
                        Your innovative solution for modern problems
                    </h2>

                    <motion.button
                        className="px-8 py-3 bg-blue-600 rounded-full text-lg font-medium shadow-lg text-white"
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: "#2563eb" // blue-700
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                        }}
                    >
                        
                        <UserProfile/>
                    </motion.button>
                </motion.div>
            </div>

            {/* Optional scrolling indicator after animation completes */}
            {animationComplete && (
                <motion.div
                    className="absolute bottom-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="w-8 h-12 rounded-full border-2 border-slate-500 flex items-center justify-center"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <div className="w-1.5 h-3 bg-slate-500 rounded-full"></div>
                    </motion.div>
                    <p className="mt-2 text-sm text-slate-500">Scroll Down</p>
                </motion.div>
            )}
        </div>
    );
};

export default LandingPage;
