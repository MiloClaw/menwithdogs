import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
 * 
 * Supports maxSelections for capped multi-select prompts.
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

  const maxSelections = prompt.maxSelections;
  const isAtLimit = maxSelections !== undefined && selectedValues.length >= maxSelections;

  const handleOptionClick = (value: string) => {
    if (prompt.multiSelect) {
      setSelectedValues(prev => {
        if (prev.includes(value)) {
          // Always allow deselection
          return prev.filter(v => v !== value);
        } else if (isAtLimit) {
          // At limit - don't allow more selections
          return prev;
        } else {
          return [...prev, value];
        }
      });
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

  // Reset selection when prompt changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedValues([]);
    }
    onOpenChange(newOpen);
  };

  const content = (
    <div className="space-y-6">
      {/* Selection counter for capped multi-select */}
      {prompt.multiSelect && maxSelections && (
        <p className="text-sm text-center text-muted-foreground">
          {selectedValues.length} of {maxSelections} selected
        </p>
      )}

      {/* Options */}
      <div className="flex flex-wrap gap-2 justify-center">
        {prompt.options.map(option => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled = !isSelected && isAtLimit;
          
          return (
            <Button
              key={option.value}
              variant={isSelected ? 'default' : 'outline'}
              size="lg"
              disabled={isDisabled}
              className={cn(
                'min-h-[52px] px-6 text-base transition-all',
                isSelected && 'ring-2 ring-primary ring-offset-2',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
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
      <Drawer open={open} onOpenChange={handleOpenChange}>
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
