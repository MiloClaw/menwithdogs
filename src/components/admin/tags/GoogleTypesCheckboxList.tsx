import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  GOOGLE_PLACE_TYPES,
  PLACE_TYPE_CATEGORIES,
  type GooglePlaceType,
} from '@/lib/google-places-types';

interface GoogleTypesCheckboxListProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

export function GoogleTypesCheckboxList({ selectedTypes, onChange }: GoogleTypesCheckboxListProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // Group types by category
  const typesByCategory = useMemo(() => {
    const grouped = new Map<string, GooglePlaceType[]>();
    for (const category of PLACE_TYPE_CATEGORIES) {
      const types = GOOGLE_PLACE_TYPES.filter(t => t.category === category.value);
      if (types.length > 0) {
        grouped.set(category.value, types);
      }
    }
    return grouped;
  }, []);

  const allTypes = GOOGLE_PLACE_TYPES.map(t => t.value);
  const isAllSelected = selectedTypes.length === allTypes.length;
  const isSomeSelected = selectedTypes.length > 0 && selectedTypes.length < allTypes.length;

  const toggleCategory = (categoryValue: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryValue)) {
        next.delete(categoryValue);
      } else {
        next.add(categoryValue);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    onChange(checked ? allTypes : []);
  };

  const handleCategorySelectAll = (categoryValue: string, checked: boolean) => {
    const categoryTypes = typesByCategory.get(categoryValue) || [];
    const categoryTypeValues = categoryTypes.map(t => t.value);
    
    if (checked) {
      // Add all types from this category
      const newSelected = new Set([...selectedTypes, ...categoryTypeValues]);
      onChange(Array.from(newSelected));
    } else {
      // Remove all types from this category
      onChange(selectedTypes.filter(t => !categoryTypeValues.includes(t)));
    }
  };

  const handleTypeToggle = (typeValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTypes, typeValue]);
    } else {
      onChange(selectedTypes.filter(t => t !== typeValue));
    }
  };

  const getCategoryCheckState = (categoryValue: string) => {
    const categoryTypes = typesByCategory.get(categoryValue) || [];
    const selectedInCategory = categoryTypes.filter(t => selectedTypes.includes(t.value)).length;
    
    if (selectedInCategory === 0) return 'none';
    if (selectedInCategory === categoryTypes.length) return 'all';
    return 'some';
  };

  return (
    <div className="space-y-2">
      <ScrollArea className="h-[300px] border rounded-lg p-3">
        {/* Select All */}
        <div className="flex items-center gap-3 pb-3 border-b mb-2">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            className="h-5 w-5"
            {...(isSomeSelected ? { 'data-state': 'indeterminate' } : {})}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer select-none min-h-[44px] flex items-center"
          >
            Select All ({allTypes.length} types)
          </label>
        </div>

        {/* Categories */}
        <div className="space-y-1">
          {PLACE_TYPE_CATEGORIES.map(category => {
            const categoryTypes = typesByCategory.get(category.value) || [];
            if (categoryTypes.length === 0) return null;

            const isOpen = openCategories.has(category.value);
            const checkState = getCategoryCheckState(category.value);
            const selectedCount = categoryTypes.filter(t => selectedTypes.includes(t.value)).length;

            return (
              <Collapsible
                key={category.value}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.value)}
              >
                <div className="flex items-center gap-2 py-1">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={checkState === 'all'}
                    onCheckedChange={(checked) => handleCategorySelectAll(category.value, !!checked)}
                    className="h-5 w-5"
                    {...(checkState === 'some' ? { 'data-state': 'indeterminate' } : {})}
                  />
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none min-h-[44px] flex-1 text-left hover:text-primary transition-colors"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                      <span>{category.label}</span>
                      <span className="text-muted-foreground text-xs">
                        ({selectedCount}/{categoryTypes.length})
                      </span>
                    </button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="ml-7 pl-2 border-l space-y-0.5 pb-2">
                    {categoryTypes.map(type => (
                      <div key={type.value} className="flex items-center gap-3">
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={selectedTypes.includes(type.value)}
                          onCheckedChange={(checked) => handleTypeToggle(type.value, !!checked)}
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={`type-${type.value}`}
                          className={cn(
                            "text-sm cursor-pointer select-none min-h-[44px] flex items-center flex-1",
                            selectedTypes.includes(type.value) && "font-medium"
                          )}
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        Leave all unchecked to apply this tag to all place types
      </p>
    </div>
  );
}
