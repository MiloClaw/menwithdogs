import { Building2 } from 'lucide-react';
import { CityCreateForm } from './CityCreateForm';
import { CityDetailView } from './CityDetailView';
import { CityDetailEdit } from './CityDetailEdit';
import type { CityWithProgress } from '@/hooks/useCities';

export type CityDetailMode = 'empty' | 'viewing' | 'editing' | 'creating';

interface CityDetailPaneProps {
  mode: CityDetailMode;
  city: CityWithProgress | null;
  onModeChange: (mode: CityDetailMode) => void;
  onCreateSuccess?: () => void;
}

export function CityDetailPane({ 
  mode, 
  city, 
  onModeChange,
  onCreateSuccess 
}: CityDetailPaneProps) {
  if (mode === 'empty') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <Building2 className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-center">Select a city to view details</p>
        <p className="text-sm text-center mt-1">or create a new one</p>
      </div>
    );
  }

  if (mode === 'creating') {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create New City</h3>
        <CityCreateForm 
          onSuccess={() => {
            onModeChange('empty');
            onCreateSuccess?.();
          }}
          onCancel={() => onModeChange('empty')}
        />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        City not found
      </div>
    );
  }

  if (mode === 'editing') {
    return (
      <div className="p-6">
        <CityDetailEdit
          city={city}
          onSave={() => onModeChange('viewing')}
          onCancel={() => onModeChange('viewing')}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <CityDetailView 
        city={city} 
        onEdit={() => onModeChange('editing')}
      />
    </div>
  );
}
