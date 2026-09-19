import { motion } from 'framer-motion';

export const Scene2 = () => {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw] z-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex-1 max-w-[35vw]">
        <motion.p
          className="text-primary font-black uppercase tracking-widest text-[1.2vw] mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        >
          For Parents
        </motion.p>
        <motion.h2 
          className="text-[4.5vw] font-black leading-[1.1] text-text-primary tracking-tight mb-6"
        >
          {['Book', 'trials', 'instantly.'].map((word, i) => (
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
          Find vetted coaches, manage schedules, and plan your child's month with ease.
        </motion.p>
      </div>

      <div className="relative w-[38vw] h-[70vh] flex flex-col justify-center gap-[2vh]" style={{ perspective: "1000px" }}>
        {/* Card 1 */}
        <motion.div
          className="bg-white rounded-[2vw] p-[1.5vw] shadow-2xl shadow-primary/10 border-2 border-primary/10 flex items-center gap-[1.5vw]"
          initial={{ opacity: 0, x: 100, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.8 }}
        >
          <div className="w-[6vw] h-[6vw] rounded-[1vw] bg-accent overflow-hidden shrink-0">
            <img src={`${import.meta.env.BASE_URL}images/kids_art_class.jpg`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-[0.9vw] font-bold text-primary mb-[0.2vw] uppercase tracking-wider">Art • 5-8 yrs</div>
            <div className="text-[1.5vw] font-black leading-tight">Creative Painting</div>
            <div className="text-[1vw] text-text-muted mt-[0.2vw] font-medium">Tomorrow, 4:00 PM</div>
          </div>
          <div className="bg-primary text-white font-bold text-[1vw] px-[1.5vw] py-[0.8vw] rounded-full shrink-0">
            Book
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          className="bg-white rounded-[2vw] p-[1.5vw] shadow-2xl shadow-secondary/10 border-2 border-secondary/10 flex items-center gap-[1.5vw] ml-[3vw]"
          initial={{ opacity: 0, x: 100, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 1.0 }}
        >
          <div className="w-[6vw] h-[6vw] rounded-[1vw] bg-accent overflow-hidden shrink-0">
            <img src={`${import.meta.env.BASE_URL}images/coach_portrait.jpg`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-[0.9vw] font-bold text-secondary mb-[0.2vw] uppercase tracking-wider">Tennis • 8-12 yrs</div>
            <div className="text-[1.5vw] font-black leading-tight">Beginner Tennis</div>
            <div className="text-[1vw] text-text-muted mt-[0.2vw] font-medium">Saturday, 9:00 AM</div>
          </div>
          <div className="bg-secondary text-white font-bold text-[1vw] px-[1.5vw] py-[0.8vw] rounded-full shrink-0">
            Book
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
