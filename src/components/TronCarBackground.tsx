"use client";
import { motion } from 'framer-motion';

export const TronCarBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30 mt-20 md:mt-0 fixed w-full h-full">
      {/* Scaled up to occupy space, explicitly centered */}
      <svg width="1200" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[150vw] md:w-[120vw] h-auto min-w-[1200px] max-w-[2000px] scale-125 transform-gpu mx-auto">
        
        {/* Shifting everything 50px right to perfectly center within the 1200 viewBox */}
        <g transform="translate(50, 0)">
          {/* Sports Car Body Outline - RED like before */}
          <motion.path
            d="M 150 300 L 230 300 A 40 40 0 0 1 350 300 L 730 300 A 40 40 0 0 1 850 300 L 950 300 C 1000 300 1050 280 1050 240 C 1050 200 980 170 900 160 C 800 145 700 80 600 80 L 450 80 C 350 80 250 130 180 150 C 120 170 80 200 80 240 C 80 280 100 300 150 300 Z"
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            style={{ filter: 'drop-shadow(0 0 16px rgba(239,68,68,0.7))' }}
          />

          {/* Front Wheel - Red */}
          <motion.circle cx="800" cy="300" r="40" stroke="#ef4444" strokeWidth="5" 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            style={{ filter: 'drop-shadow(0 0 24px rgba(239,68,68,1))' }}
          />
          
          {/* Rear Wheel - Red */}
          <motion.circle cx="290" cy="300" r="40" stroke="#ef4444" strokeWidth="5" 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            style={{ filter: 'drop-shadow(0 0 24px rgba(239,68,68,1))' }}
          />

          {/* Inner Wheel Details */}
          <motion.circle cx="800" cy="300" r="15" stroke="#ef4444" strokeWidth="2" 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
          <motion.circle cx="290" cy="300" r="15" stroke="#ef4444" strokeWidth="2" 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
          
          {/* Speed Lines - Red */}
          <motion.path d="M -100 250 L 100 250 M 50 150 L 180 150 M -50 350 L 80 350 M -150 100 L 0 100" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: 500, opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </g>
      </svg>
    </div>
  );
};
