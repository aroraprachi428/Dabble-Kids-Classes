import { motion } from 'framer-motion';

export const Scene5 = () => {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-bg-light z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="relative z-10 text-center flex flex-col items-center">
        <motion.h1 
          className="text-[12vw] font-black tracking-tighter text-primary drop-shadow-lg leading-none"
          initial={{ y: 50, opacity: 0, scale: 0.9, rotateX: -45 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ perspective: "1000px" }}
        >
          Dabble.
        </motion.h1>
        <motion.p
          className="text-[2vw] font-bold text-text-secondary tracking-tight mt-[1vw] max-w-[40vw]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        >
          The complete platform for kids' activities, from discovery to operations.
        </motion.p>
      </div>
    </motion.div>
  );
};
