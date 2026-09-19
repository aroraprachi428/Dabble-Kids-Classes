import { motion } from 'framer-motion';

export const Scene1 = () => {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-bg-dark z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
    >
      <motion.div
        className="absolute inset-0 origin-center"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 4, ease: "easeOut" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/kids_art_class.jpg`} 
          className="w-full h-full object-cover opacity-80" 
          alt="Kids Art Class"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/20 to-transparent" />
      </motion.div>

      <div className="relative z-10 text-center flex flex-col items-center" style={{ perspective: "1000px" }}>
        <motion.h1 
          className="text-[12vw] font-black tracking-tighter text-white drop-shadow-2xl leading-none"
          initial={{ y: 100, opacity: 0, rotateX: 80, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          Dabble.
        </motion.h1>
        <motion.p
          className="text-[2.2vw] font-bold text-white/90 tracking-widest uppercase mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        >
          Discover. Learn. Grow.
        </motion.p>
      </div>
    </motion.div>
  );
};
