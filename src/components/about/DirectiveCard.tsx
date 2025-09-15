'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DirectiveCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
  delay: number;
}

export default function DirectiveCard({
  icon,
  title,
  description,
  items,
  delay
}: DirectiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="mg-container p-0.5 group cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Holo projection effect on hover */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0, 215, 255, 0.15)"
          }}
          animate={{
            opacity: isHovered ? 0.2 : 0,
            height: isHovered ? "100%" : "0%"
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated border */}
        <div className="absolute inset-px z-10 bg-transparent border border-[rgba(var(--mg-primary),0.3)] group-hover:border-[rgba(var(--mg-primary),0.6)] transition-colors duration-300"></div>

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-5 h-5 z-10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute top-0 left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        <div className="absolute top-0 right-0 w-5 h-5 z-10">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute top-0 right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-5 h-5 z-10">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute bottom-0 left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-5 h-5 z-10">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute bottom-0 right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>

        {/* Scanning effect */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 w-full h-1"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(0, 215, 255, 0.4), transparent)'
              }}
              animate={{
                top: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>

        {/* Inner content */}
        <div className="relative z-0 h-full p-6 bg-[rgba(var(--mg-background),0.5)]">
          <div className="flex items-start mb-4">
            <motion.div
              className="mr-3 mt-1"
              animate={{
                rotate: isHovered ? [0, 5, 0, -5, 0] : 0
              }}
              transition={{ duration: 5, repeat: isHovered ? Infinity : 0 }}
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(0, 215, 255, 0.1)",
                  borderColor: "rgba(0, 215, 255, 0.3)",
                  borderWidth: "1px"
                }}
                animate={{
                  boxShadow: isHovered
                    ? [
                        "0 0 0px rgba(0, 215, 255, 0.2)",
                        "0 0 10px rgba(0, 215, 255, 0.5)",
                        "0 0 0px rgba(0, 215, 255, 0.2)"
                      ]
                    : "0 0 0px rgba(0, 215, 255, 0)"
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </svg>
              </motion.div>
            </motion.div>
            <div>
              <h3 className="mg-text text-lg font-bold mb-2">{title}</h3>
              <p className="text-sm text-[rgba(var(--mg-text),0.7)]">
                {description}
              </p>
            </div>
          </div>

          <motion.div
            className="mt-4 pt-3"
            style={{
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: isHovered ? "rgba(0, 215, 255, 0.6)" : "rgba(0, 215, 255, 0.2)"
            }}
            transition={{ duration: 0.3 }}
          >
            <ul className="space-y-2 text-xs">
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.1 + (index * 0.1) }}
                >
                  <motion.span
                    className="mr-2 mt-1 w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(0, 215, 255, 0.7)"
                    }}
                    animate={{
                      scale: isHovered ? [1, 1.5, 1] : 1,
                      backgroundColor: isHovered
                        ? [
                            "rgba(0, 215, 255, 0.7)",
                            "rgba(30, 250, 255, 0.7)",
                            "rgba(0, 215, 255, 0.7)"
                          ]
                        : "rgba(0, 215, 255, 0.7)"
                    }}
                    transition={{
                      duration: 2,
                      repeat: isHovered ? Infinity : 0,
                      delay: index * 0.2
                    }}
                  ></motion.span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}