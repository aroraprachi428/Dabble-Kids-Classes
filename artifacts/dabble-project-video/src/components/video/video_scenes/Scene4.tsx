import { motion } from 'framer-motion';

export const Scene4 = () => {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center mb-[4vw]">
        <motion.p
          className="text-accent-2 font-black uppercase tracking-widest text-[1.2vw] mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          For Operations
        </motion.p>
        <motion.h2 
          className="text-[4.5vw] font-black leading-[1.1] text-text-primary tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Scale with clarity.
        </motion.h2>
      </div>

      <div className="flex gap-[2vw] perspective-[1000px]">
        {/* Stat Card 1 */}
        <motion.div
          className="bg-white p-[2vw] rounded-[2vw] shadow-2xl shadow-text-primary/5 border-2 border-bg-muted min-w-[18vw]"
          initial={{ opacity: 0, y: 50, rotateX: 30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.8 }}
        >
          <div className="text-[0.9vw] font-black uppercase tracking-widest text-text-muted mb-[1vw]">Total Bookings</div>
          <motion.div 
            className="text-[3vw] font-black text-text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            1,248
          </motion.div>
          <div className="w-full h-[0.5vw] bg-bg-muted rounded-full mt-[1vw] overflow-hidden">
            <motion.div className="h-full bg-accent-2" initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ delay: 1.5, duration: 1 }} />
          </div>
        </motion.div>

        {/* Stat Card 2 */}
        <motion.div
          className="bg-primary text-white p-[2vw] rounded-[2vw] shadow-2xl shadow-primary/20 min-w-[20vw] relative overflow-hidden"
          initial={{ opacity: 0, y: 50, rotateX: 30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 1.0 }}
        >
          <div className="absolute -right-[2vw] -top-[2vw] w-[10vw] h-[10vw] bg-white/10 rounded-full blur-2xl" />
          <div className="text-[0.9vw] font-black uppercase tracking-widest text-white/70 mb-[1vw]">Monthly GMV</div>
          <motion.div 
            className="text-[3.5vw] font-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            ₹8.5L
          </motion.div>
          <div className="mt-[1vw] text-white/90 font-bold text-[1.2vw]">
            +24% from last month
          </div>
        </motion.div>

        {/* Stat Card 3 */}
        <motion.div
          className="bg-white p-[2vw] rounded-[2vw] shadow-2xl shadow-text-primary/5 border-2 border-bg-muted min-w-[18vw]"
          initial={{ opacity: 0, y: 50, rotateX: 30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 1.2 }}
        >
          <div className="text-[0.9vw] font-black uppercase tracking-widest text-text-muted mb-[1vw]">Active Coaches</div>
          <motion.div 
            className="text-[3vw] font-black text-text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            156
          </motion.div>
          <div className="w-full h-[0.5vw] bg-bg-muted rounded-full mt-[1vw] overflow-hidden">
            <motion.div className="h-full bg-secondary" initial={{ width: 0 }} animate={{ width: "90%" }} transition={{ delay: 1.7, duration: 1 }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
