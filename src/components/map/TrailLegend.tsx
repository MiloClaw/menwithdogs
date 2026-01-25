import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const TrailLegend = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="absolute bottom-24 md:bottom-20 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-border"
    >
      <p className="text-xs font-medium text-foreground mb-2">Trail Difficulty</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-emerald-500 rounded-full" />
          <span className="text-xs text-muted-foreground">Easy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-amber-500 rounded-full" />
          <span className="text-xs text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-red-500 rounded-full" />
          <span className="text-xs text-muted-foreground">Strenuous</span>
        </div>
      </div>
    </motion.div>
  );
});

TrailLegend.displayName = 'TrailLegend';

export default TrailLegend;
