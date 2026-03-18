import { useState } from 'react';
import { X, Plus, Brain, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface GoogleTypesEditorProps {
  value: string[];
  onChange: (types: string[]) => void;
  optionLabel?: string;
}

/**
 * Common outdoor-relevant Google Place types for Men With Dogs
 * Organized by category for quick reference
 */
const COMMON_OUTDOOR_TYPES = {
  'Parks & Trails': [
    'hiking_area',
    'park',
    'national_park', 
    'state_park',
    'dog_park',
    'playground',
  ],
  'Water & Beach': [
    'beach',
    'marina',
    'swimming_pool',
  ],
  'Nature & Wildlife': [
    'nature_preserve',
    'wildlife_park',
    'zoo',
    'aquarium',
    'botanical_garden',
    'garden',
  ],
  'Camping': [
    'campground',
    'rv_park',
    'picnic_ground',
  ],
  'Sports & Fitness': [
    'gym',
    'fitness_center',
    'yoga_studio',
    'sports_complex',
    'athletic_field',
    'golf_course',
    'tennis_court',
    'basketball_court',
    'ski_resort',
    'ice_skating_rink',
  ],
  'Wellness': [
    'spa',
    'wellness_center',
  ],
};

/**
 * Editor for Google Place type mappings in PRO context definitions.
 * Changes to these mappings directly affect the intelligence/affinity engine.
 */
export function GoogleTypesEditor({ value, onChange, optionLabel }: GoogleTypesEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const addType = (type: string) => {
    const normalized = type.toLowerCase().trim().replace(/\s+/g, '_');
    if (normalized && !value.includes(normalized)) {
      onChange([...value, normalized]);
    }
    setInputValue('');
  };

  const removeType = (type: string) => {
    onChange(value.filter(t => t !== type));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addType(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Google Place Type Mappings</Label>
        <p className="text-xs text-muted-foreground mt-1">
          When users select this option, places with these Google types will be boosted in rankings.
        </p>
      </div>

      {/* Current types as chips */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-muted/20">
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground">No types mapped yet</p>
        ) : (
          value.map((type) => (
            <Badge 
              key={type} 
              variant="secondary" 
              className="gap-1 pl-2 pr-1 py-1 text-sm"
            >
              <span className="font-mono">{type}</span>
              <button
                type="button"
                onClick={() => removeType(type)}
                className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      {/* Input to add new type */}
      <div className="flex gap-2">
        <Input
          placeholder="Type name (e.g., hiking_area)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="font-mono text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addType(inputValue)}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick add toggle */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowQuickAdd(!showQuickAdd)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Zap className="h-4 w-4 mr-2" />
        {showQuickAdd ? 'Hide quick-add' : 'Show outdoor types for quick-add'}
      </Button>

      {/* Quick-add panel */}
      {showQuickAdd && (
        <ScrollArea className="h-[200px] rounded-lg border p-3 bg-muted/10">
          <div className="space-y-4">
            {Object.entries(COMMON_OUTDOOR_TYPES).map(([category, types]) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {types.map((type) => {
                    const isSelected = value.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => isSelected ? removeType(type) : addType(type)}
                        className={cn(
                          'px-2 py-1 rounded text-xs font-mono transition-colors',
                          isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Intelligence impact preview */}
      {value.length > 0 && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
            <Brain className="h-4 w-4" />
            Intelligence Impact
          </div>
          <p className="text-xs text-muted-foreground">
            When a Pro user selects "<span className="font-medium">{optionLabel || 'this option'}</span>", 
            places with types [{value.slice(0, 4).join(', ')}{value.length > 4 ? `, +${value.length - 4} more` : ''}] 
            will receive a ranking boost in their personalized results.
          </p>
        </div>
      )}
    </div>
  );
}

export default GoogleTypesEditor;
