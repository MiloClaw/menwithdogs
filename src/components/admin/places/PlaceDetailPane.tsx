import { Place, CreatePlaceInput } from '@/hooks/usePlaces';
import PlaceDetailView from './PlaceDetailView';
import PlaceDetailEdit from './PlaceDetailEdit';
import PlaceCreateForm from './PlaceCreateForm';

export type PlaceDetailMode =
  | { type: 'empty' }
  | { type: 'viewing'; placeId: string }
  | { type: 'editing'; placeId: string }
  | { type: 'creating' };

interface PlaceDetailPaneProps {
  mode: PlaceDetailMode;
  places: Place[];
  onModeChange: (mode: PlaceDetailMode) => void;
  onSave: (id: string, updates: Partial<Place>) => Promise<void>;
  onCreate: (input: CreatePlaceInput) => Promise<void>;
  isUpdating?: boolean;
  isCreating?: boolean;
  locationBias?: { lat: number; lng: number };
}

const PlaceDetailPane = ({
  mode,
  places,
  onModeChange,
  onSave,
  onCreate,
  isUpdating,
  isCreating,
  locationBias,
}: PlaceDetailPaneProps) => {
  const selectedPlace = mode.type === 'viewing' || mode.type === 'editing'
    ? places.find(p => p.id === mode.placeId)
    : null;

  // Empty state
  if (mode.type === 'empty') {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Select a place to review</p>
          <p className="text-sm mt-1">Or click "Add Place" to create one</p>
        </div>
      </div>
    );
  }

  // Creating mode
  if (mode.type === 'creating') {
    return (
      <PlaceCreateForm
        onCancel={() => onModeChange({ type: 'empty' })}
        onCreate={async (input) => {
          await onCreate(input);
          onModeChange({ type: 'empty' });
        }}
        existingPlaces={places}
        isCreating={isCreating}
        locationBias={locationBias}
      />
    );
  }

  // Handle case where place not found
  if (!selectedPlace) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Place not found</p>
          <p className="text-sm mt-1">It may have been deleted</p>
        </div>
      </div>
    );
  }

  // Editing mode
  if (mode.type === 'editing') {
    return (
      <PlaceDetailEdit
        place={selectedPlace}
        onSave={async (updates) => {
          await onSave(selectedPlace.id, updates);
          onModeChange({ type: 'viewing', placeId: selectedPlace.id });
        }}
        onCancel={() => onModeChange({ type: 'viewing', placeId: selectedPlace.id })}
        isSaving={isUpdating}
      />
    );
  }

  // Viewing mode
  return (
    <PlaceDetailView
      place={selectedPlace}
      onEdit={() => onModeChange({ type: 'editing', placeId: selectedPlace.id })}
      onStatusChange={async (status) => {
        await onSave(selectedPlace.id, { status });
      }}
      isUpdating={isUpdating}
    />
  );
};

export default PlaceDetailPane;
