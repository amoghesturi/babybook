'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  pageId: string;
  direction: 'next' | 'prev';
  children: React.ReactNode;
}

const variants = {
  enter: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? '60%' : '-60%',
    opacity: 0,
    scale: 0.95,
    rotateY: direction === 'next' ? 8 : -8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
  },
  exit: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? '-60%' : '60%',
    opacity: 0,
    scale: 0.95,
    rotateY: direction === 'next' ? -8 : 8,
  }),
};

export function PageFlip({ pageId, direction, children }: Props) {
  return (
    <div style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={pageId}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.25 },
            rotateY: { duration: 0.3 },
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
