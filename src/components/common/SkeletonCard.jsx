import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <motion.div 
    className="skeleton-card"
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1, direction: "alternate" }}
  >
    <div className="skeleton-line title"></div>
    <div className="skeleton-line subtitle"></div>
    <div className="skeleton-line details"></div>
  </motion.div>
);
