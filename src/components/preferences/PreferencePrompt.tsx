import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { PromptDefinition } from '@/lib/preference-prompts';
import { cn } from '@/lib/utils';

interface PreferencePromptProps {
  prompt: PromptDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnswer: (value: string | string[]) => void;
  onSkip: () => void;
}

/**
 * Behavioral preference prompt component.
 * 
 * Renders as a bottom drawer on mobile, modal on desktop.
 * Single-question format with structured options.
 * Always skippable with subtle reassurance copy.
 */
const PreferencePrompt = ({
  prompt,
  open,
  onOpenChange,
  onAnswer,
  onSkip,
}: PreferencePromptProps) => {
  const isMobile = useIsMobile();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleOptionClick = (value: string) => {
    if (prompt.multiSelect) {
      setSelectedValues(prev => 
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else {
      // Single select - submit immediately
      onAnswer(value);
    }
  };

  const handleMultiSelectDone = () => {
    if (selectedValues.length > 0) {
      onAnswer(selectedValues);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Options */}
      <div className="flex flex-wrap gap-2 justify-center">
        {prompt.options.map(option => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <Button
              key={option.value}
              variant={isSelected ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'min-h-[52px] px-6 text-base transition-all',
                isSelected && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Multi-select done button */}
      {prompt.multiSelect && selectedValues.length > 0 && (
        <Button 
          className="w-full"
          size="lg"
          onClick={handleMultiSelectDone}
        >
          Done
        </Button>
      )}

      {/* Footer with reassurance */}
      <p className="text-sm text-muted-foreground text-center">
        {prompt.footer}
      </p>
    </div>
  );

  const footerContent = (
    <Button
      variant="ghost"
      onClick={onSkip}
      className="text-muted-foreground"
    >
      Skip
    </Button>
  );

  // Mobile: use drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center">
            <p className="text-sm text-muted-foreground mb-1">{prompt.header}</p>
            <DrawerTitle className="font-serif text-xl">
              {prompt.question}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {content}
          </div>
          <DrawerFooter className="pt-2">
            {footerContent}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use dialog (modal)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">{prompt.header}</p>
          <DialogTitle className="font-serif text-xl">
            {prompt.question}
          </DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter className="sm:justify-center">
          {footerContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencePrompt;
