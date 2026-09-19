import { motion } from 'framer-motion';

export const Scene3 = () => {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw] z-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-[35vw] h-[70vh] flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-secondary/10 rounded-[3vw] rotate-3"
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 3, scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
        <motion.div
          className="relative w-full h-[90%] rounded-[3vw] overflow-hidden shadow-2xl shadow-secondary/20 border-4 border-white"
          initial={{ rotate: 0, scale: 0.9, opacity: 0 }}
          animate={{ rotate: -2, scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <img src={`${import.meta.env.BASE_URL}images/coach_portrait.jpg`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent" />
          
          <motion.div 
            className="absolute bottom-[2vw] left-[2vw] right-[2vw]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="bg-white/95 backdrop-blur-md p-[1.5vw] rounded-[1.5vw] flex items-center justify-between shadow-xl">
              <div>
                <div className="text-[0.8vw] font-black uppercase text-secondary tracking-widest mb-[0.2vw]">Total Earnings</div>
                <div className="text-[2.5vw] font-black text-text-primary leading-none">₹42,500</div>
              </div>
              <div className="bg-secondary/10 text-secondary px-[1vw] py-[0.5vw] rounded-lg font-bold text-[1vw]">
                +15% this week
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="flex-1 max-w-[35vw] ml-[5vw]">
        <motion.p
          className="text-secondary font-black uppercase tracking-widest text-[1.2vw] mb-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        >
          For Coaches
        </motion.p>
        <motion.h2 
          className="text-[4.5vw] font-black leading-[1.1] text-text-primary tracking-tight mb-6"
        >
          {['Manage,', 'teach,', '& earn.'].map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[1vw]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] font-medium text-text-secondary mt-2 max-w-[30vw]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          A complete dashboard to track upcoming sessions, monitor revenue, and manage bookings.
        </motion.p>
      </div>
    </motion.div>
  );
};
