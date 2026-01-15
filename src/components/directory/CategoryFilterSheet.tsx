import { useState } from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterSheetProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onCategorySignal?: (category: string) => void;
}

/**
 * Mobile-only bottom sheet for category filters.
 * Keeps distance filters visible while collapsing categories.
 * 
 * Touch targets: 44px minimum
 * UX: Sheet pattern for calm, focused selection
 */
export function CategoryFilterSheet({
  categories,
  selectedCategory,
  onCategoryChange,
  onCategorySignal,
}: CategoryFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<string | null>(selectedCategory);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTempSelection(selectedCategory);
    }
  };

  const handleApply = () => {
    onCategoryChange(tempSelection);
    if (tempSelection && onCategorySignal) {
      onCategorySignal(tempSelection);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setTempSelection(null);
    onCategoryChange(null);
    setOpen(false);
  };

  const activeCount = selectedCategory ? 1 : 0;

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="min-h-[44px] rounded-lg gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge 
              variant="secondary" 
              className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-serif">What kind?</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-4 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTempSelection(null)}
              className={`
                min-h-[44px] px-4 rounded-lg text-sm font-medium transition-all border flex items-center gap-2
                ${tempSelection === null 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-transparent text-foreground border-border'}
              `}
            >
              All
              {tempSelection === null && <Check className="h-4 w-4" />}
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setTempSelection(tempSelection === category ? null : category)}
                className={`
                  min-h-[44px] px-4 rounded-lg text-sm font-medium transition-all border flex items-center gap-2
                  ${tempSelection === category 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-transparent text-foreground border-border'}
                `}
              >
                {category}
                {tempSelection === category && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 min-h-[44px]"
          >
            Clear
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 min-h-[44px]"
          >
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default CategoryFilterSheet;
