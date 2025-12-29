import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useGooglePlaces, PlacePrediction, PlaceDetails } from '@/hooks/useGooglePlaces';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (details: PlaceDetails) => void;
  placeholder?: string;
  types?: string; // "(cities)" for cities, "establishment" for venues
  className?: string;
  disabled?: boolean;
}

const GooglePlacesAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search for a location',
  types = '(cities)',
  className,
  disabled = false,
}: GooglePlacesAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const {
    predictions,
    isLoading,
    fetchAutocomplete,
    fetchDetails,
    clearPredictions,
  } = useGooglePlaces();

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setSelectedIndex(-1);

    // Debounce API calls - reduced to 200ms for snappier UX
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Start showing predictions after just 1 character
    if (newValue.length >= 1) {
      debounceRef.current = setTimeout(() => {
        fetchAutocomplete(newValue, types);
        setShowDropdown(true);
      }, 200);
    } else {
      clearPredictions();
      setShowDropdown(false);
    }
  }, [onChange, fetchAutocomplete, clearPredictions, types]);

  const handleSelectPrediction = useCallback(async (prediction: PlacePrediction) => {
    const displayValue = prediction.structured_formatting?.main_text || prediction.description;
    setInputValue(displayValue);
    onChange(displayValue);
    setShowDropdown(false);
    clearPredictions();

    // Fetch full details
    const details = await fetchDetails(prediction.place_id);
    if (details && onPlaceSelect) {
      onPlaceSelect(details);
    }
  }, [onChange, fetchDetails, onPlaceSelect, clearPredictions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSelectPrediction(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showDropdown, predictions, selectedIndex, handleSelectPrediction]);

  const handleFocus = useCallback(() => {
    // Show dropdown on focus if we have predictions or user has typed something
    if (predictions.length > 0) {
      setShowDropdown(true);
    } else if (inputValue.length >= 1) {
      // Re-fetch if user focuses back on input with content
      fetchAutocomplete(inputValue, types);
      setShowDropdown(true);
    }
  }, [predictions.length, inputValue, fetchAutocomplete, types]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-9 pr-8 h-12"
          disabled={disabled}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <ul
            className="max-h-60 overflow-auto"
            role="listbox"
          >
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  'flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors',
                  'min-h-[44px]', // Touch target
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                )}
                onClick={() => handleSelectPrediction(prediction)}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </span>
                  {prediction.structured_formatting?.secondary_text && (
                    <span className="text-sm text-muted-foreground truncate">
                      {prediction.structured_formatting.secondary_text}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {/* Google Attribution - Required by TOS */}
          <div className="px-3 py-2 border-t border-border bg-muted/50">
            <span className="text-xs text-muted-foreground">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
