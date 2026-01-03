import { useState, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useGooglePlaces, PlaceDetails, PlacePrediction } from '@/hooks/useGooglePlaces';
import { useToast } from '@/hooks/use-toast';

interface GooglePlaceSearchProps {
  onPlaceSelected: (details: PlaceDetails) => void;
  disabled?: boolean;
}

const GooglePlaceSearch = ({ onPlaceSelected, disabled }: GooglePlaceSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { toast } = useToast();
  
  const {
    predictions,
    isLoading: isLoadingPredictions,
    fetchAutocomplete,
    fetchDetails,
    clearPredictions,
    resetSessionToken,
  } = useGooglePlaces();

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (value.trim().length >= 1) {
      fetchAutocomplete(value, 'establishment');
    } else {
      clearPredictions();
    }
  }, [fetchAutocomplete, clearPredictions]);

  const handleSelectPrediction = useCallback(async (prediction: PlacePrediction) => {
    setIsLoadingDetails(true);
    
    try {
      const details = await fetchDetails(prediction.place_id);
      
      if (details) {
        onPlaceSelected(details);
        setOpen(false);
        setSearchValue('');
        clearPredictions();
      } else {
        toast({
          title: 'Failed to fetch place details',
          description: 'Please try again or select a different place.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error fetching place details',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  }, [fetchDetails, onPlaceSelected, clearPredictions, toast]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchValue('');
      clearPredictions();
      resetSessionToken();
    }
  }, [clearPredictions, resetSessionToken]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoadingDetails}
          className="w-full justify-start text-muted-foreground"
        >
          {isLoadingDetails ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading place details...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Google Places...
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type venue name or address..."
            value={searchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isLoadingPredictions ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                Searching...
              </div>
            ) : predictions.length === 0 && searchValue.length > 0 ? (
              <CommandEmpty>No places found.</CommandEmpty>
            ) : (
              predictions.map((prediction) => (
                <CommandItem
                  key={prediction.place_id}
                  value={prediction.place_id}
                  onSelect={() => handleSelectPrediction(prediction)}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </span>
                    {prediction.structured_formatting?.secondary_text && (
                      <span className="truncate text-xs text-muted-foreground">
                        {prediction.structured_formatting.secondary_text}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>
          
          {/* Google Attribution */}
          <div className="border-t px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Powered by Google
            </span>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GooglePlaceSearch;
