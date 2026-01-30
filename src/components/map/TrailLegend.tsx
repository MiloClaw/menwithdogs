import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Footprints } from 'lucide-react';

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
          <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center">
            <Footprints className="w-2.5 h-2.5 text-emerald-500" />
          </div>
          <span className="text-xs text-muted-foreground">Easy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-amber-500 bg-white flex items-center justify-center">
            <Footprints className="w-2.5 h-2.5 text-amber-500" />
          </div>
          <span className="text-xs text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-white flex items-center justify-center">
            <Footprints className="w-2.5 h-2.5 text-red-500" />
          </div>
          <span className="text-xs text-muted-foreground">Strenuous</span>
        </div>
      </div>
    </motion.div>
  );
});

TrailLegend.displayName = 'TrailLegend';

export default TrailLegend;
