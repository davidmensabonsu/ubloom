 import { motion, AnimatePresence } from 'framer-motion';
 import { useEffect, useState } from 'react';
 
 interface CelebrationOverlayProps {
   show: boolean;
   type: 'all-complete' | 'streak-milestone';
   streakDays?: number;
   onComplete?: () => void;
 }
 
 const confettiColors = [
   'hsl(var(--primary))',
   'hsl(var(--accent))',
   '#FFD700',
   '#FF69B4',
   '#87CEEB',
   '#98FB98',
 ];
 
 const emojis = ['✨', '💫', '⭐'];
 
 function Confetti({ delay, x }: { delay: number; x: number }) {
   const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
   const size = Math.random() * 8 + 6;
   const rotation = Math.random() * 360;
   
   return (
     <motion.div
       initial={{ 
         y: -20, 
         x: x, 
         opacity: 1, 
         rotate: 0,
         scale: 0
       }}
       animate={{ 
         y: window.innerHeight + 100, 
         x: x + (Math.random() - 0.5) * 200,
         opacity: [1, 1, 0],
         rotate: rotation + Math.random() * 720,
         scale: [0, 1, 1, 0.5]
       }}
       transition={{ 
         duration: 2.5 + Math.random(), 
         delay,
         ease: [0.25, 0.46, 0.45, 0.94]
       }}
       style={{
         position: 'absolute',
         width: size,
         height: size * 1.5,
         backgroundColor: color,
         borderRadius: '2px',
         top: 0,
       }}
     />
   );
 }
 
 function FloatingEmoji({ delay, x }: { delay: number; x: number }) {
   const emoji = emojis[Math.floor(Math.random() * emojis.length)];
   
   return (
     <motion.div
       initial={{ 
         y: window.innerHeight / 2, 
         x: x, 
         opacity: 0, 
         scale: 0
       }}
       animate={{ 
         y: -100, 
         x: x + (Math.random() - 0.5) * 100,
         opacity: [0, 1, 1, 0],
         scale: [0, 1.2, 1, 0.5]
       }}
       transition={{ 
         duration: 2, 
         delay,
         ease: 'easeOut'
       }}
       className="absolute text-2xl"
     >
       {emoji}
     </motion.div>
   );
 }
 
 export default function CelebrationOverlay({ 
   show, 
   type, 
   streakDays,
   onComplete 
 }: CelebrationOverlayProps) {
   const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([]);
   
   useEffect(() => {
     if (show) {
       const newParticles = Array.from({ length: 30 }, (_, i) => ({
         id: i,
         x: Math.random() * window.innerWidth,
         delay: Math.random() * 0.5,
       }));
       setParticles(newParticles);
       
       const timer = setTimeout(() => {
         onComplete?.();
       }, 3000);
       
       return () => clearTimeout(timer);
     }
   }, [show, onComplete]);
 
    const getMessage = () => {
      if (type === 'all-complete') {
        return { title: "You did it!", subtitle: "All habits completed today!" };
      }
      if (streakDays === 3) {
        return { title: "3 Day Streak!", subtitle: "You're building momentum!" };
      }
      if (streakDays === 7) {
        return { title: "1 Week Streak!", subtitle: "Amazing consistency!" };
      }
      if (streakDays === 14) {
        return { title: "2 Week Streak!", subtitle: "You're unstoppable!" };
      }
      if (streakDays === 30) {
        return { title: "30 Day Streak!", subtitle: "Legendary dedication!" };
      }
      return { title: "Milestone!", subtitle: `${streakDays} day streak!` };
    };
 
   const message = getMessage();
 
   return (
     <AnimatePresence>
       {show && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
         >
           {/* Confetti particles */}
           {particles.map((p) => (
             <Confetti key={p.id} delay={p.delay} x={p.x} />
           ))}
           
           {/* Floating emojis */}
           {particles.slice(0, 10).map((p) => (
             <FloatingEmoji key={`emoji-${p.id}`} delay={p.delay + 0.2} x={p.x} />
           ))}
           
           {/* Center message */}
           <motion.div
             initial={{ scale: 0, opacity: 0 }}
             animate={{ 
               scale: [0, 1.2, 1], 
               opacity: [0, 1, 1, 1, 0] 
             }}
             transition={{ 
               duration: 2.5,
               times: [0, 0.2, 0.3, 0.8, 1]
             }}
             className="absolute inset-0 flex items-center justify-center"
           >
             <div className="glass-card rounded-3xl p-8 text-center shadow-2xl">
               <motion.h2 
                 className="text-3xl font-display font-semibold mb-2"
                 initial={{ y: 20 }}
                 animate={{ y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                 {message.title}
               </motion.h2>
               <motion.p 
                 className="text-muted-foreground"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.3 }}
               >
                 {message.subtitle}
               </motion.p>
             </div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 }