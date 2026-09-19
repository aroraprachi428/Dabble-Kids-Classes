import { motion } from 'framer-motion';

export const CrossSceneElements = ({ currentScene }: { currentScene: number }) => {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: currentScene === 0 || currentScene === 4 ? 0 : 0.05,
          x: currentScene * -20,
          rotate: currentScene * 2
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/abstract_teal_shapes.jpg`} 
          alt="" 
          className="w-full h-full object-cover" 
        />
      </motion.div>

      {/* Persistent Dabble logo mark that moves around */}
      <motion.div
        className="absolute z-50 font-display font-black tracking-tighter"
        animate={{
          top: currentScene === 0 ? '50%' : '5%',
          left: currentScene === 0 ? '50%' : '4%',
          x: currentScene === 0 ? '-50%' : '0%',
          y: currentScene === 0 ? '-100%' : '0%', // slightly up on scene 0
          scale: currentScene === 0 ? 0 : 1.5, // Actually let's hide it in scene 0, it appears big in Scene1 inside the scene itself
          opacity: currentScene === 0 || currentScene === 4 ? 0 : 1, 
          color: 'var(--color-primary)'
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        Dabble.
      </motion.div>

      {/* Decorative Blobs */}
      <motion.div
        className="absolute rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none z-0"
        style={{ width: '40vw', height: '40vw', backgroundColor: 'var(--color-primary)' }}
        animate={{
          top: currentScene === 1 ? '-10%' : currentScene === 2 ? '40%' : '80%',
          left: currentScene === 1 ? '60%' : currentScene === 2 ? '-10%' : '20%',
          opacity: [0, 4].includes(currentScene) ? 0 : 0.15,
          scale: currentScene === 1 ? 1 : currentScene === 2 ? 1.5 : 0.8
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none z-0"
        style={{ width: '40vw', height: '40vw', backgroundColor: 'var(--color-secondary)' }}
        animate={{
          bottom: currentScene === 1 ? '-10%' : currentScene === 2 ? '20%' : '-10%',
          right: currentScene === 1 ? '60%' : currentScene === 2 ? '-20%' : '10%',
          opacity: [0, 4].includes(currentScene) ? 0 : 0.15,
          scale: currentScene === 1 ? 1.2 : currentScene === 2 ? 0.9 : 1.4
        }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.1 }}
      />
    </>
  );
};
