import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useCitySeedWizard } from '@/hooks/useCitySeedWizard';
import { SeedCategoryPicker } from './SeedCategoryPicker';
import { SeedCandidateGrid } from './SeedCandidateGrid';

interface CitySeedWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cityId: string;
  cityName: string;
  lat: number;
  lng: number;
}

export function CitySeedWizard({
  open,
  onOpenChange,
  cityId,
  cityName,
  lat,
  lng,
}: CitySeedWizardProps) {
  const {
    step,
    selectedTypes,
    radius,
    candidates,
    importProgress,
    selectedCount,
    newCandidateCount,
    isSearching,
    isImporting,
    isScanningReviews,
    searchKeywords,
    minRating,
    minReviewCount,
    setSelectedTypes,
    setRadius,
    startDiscovery,
    startImport,
    toggleCandidate,
    selectAll,
    reset,
    setStep,
    setSearchKeywords,
    setMinRating,
    setMinReviewCount,
    scanCandidateReviews,
    scanAllReviews,
  } = useCitySeedWizard(cityId, cityName);

  const handleClose = () => {
    if (!isSearching && !isImporting) {
      reset();
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (step === 'review') {
      setStep('configure');
    }
  };

  const stepLabels = ['Configure', 'Discover', 'Review & Scan', 'Import'];
  const stepKeys = ['configure', 'discovering', 'review', 'importing'];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Seed {cityName}
          </DialogTitle>
          <DialogDescription>
            Auto-discover anchor venues using Google Places Nearby Search
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {stepLabels.map((label, i) => {
            const stepIndex = stepKeys.indexOf(step);
            const isActive = i === stepIndex || (step === 'complete' && i === 3);
            const isPast = i < stepIndex || step === 'complete';
            
            return (
              <div key={label} className="flex items-center">
                <Badge
                  variant={isActive || isPast ? 'default' : 'outline'}
                  className={`${isPast ? 'bg-green-600' : ''} whitespace-nowrap`}
                >
                  {isPast ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                  {label}
                </Badge>
                {i < 3 && <div className="w-6 h-px bg-border mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 'configure' && (
            <SeedCategoryPicker
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              radius={radius}
              onRadiusChange={setRadius}
              searchKeywords={searchKeywords}
              onKeywordsChange={setSearchKeywords}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              minReviewCount={minReviewCount}
              onMinReviewCountChange={setMinReviewCount}
            />
          )}

          {step === 'discovering' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Searching for venues near {cityName}...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments for multiple categories.
              </p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              {candidates.length > 0 ? (
                <SeedCandidateGrid
                  candidates={candidates}
                  onToggle={toggleCandidate}
                  onSelectAll={selectAll}
                  selectedCount={selectedCount}
                  newCandidateCount={newCandidateCount}
                  searchKeywords={searchKeywords}
                  onScanReviews={scanCandidateReviews}
                  onScanAllReviews={scanAllReviews}
                  isScanningReviews={isScanningReviews}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <p className="text-muted-foreground">No venues found in this area.</p>
                  <Button variant="outline" onClick={() => setStep('configure')}>
                    Adjust Search Settings
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Importing places ({importProgress.current} / {importProgress.total})
              </p>
              <Progress
                value={(importProgress.current / importProgress.total) * 100}
                className="w-64"
              />
              <p className="text-sm text-muted-foreground">
                Fetching full details for each venue...
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-lg font-medium">Seeding Complete!</p>
              <p className="text-muted-foreground">
                {importProgress.total} places have been added to {cityName}.
              </p>
              <p className="text-sm text-muted-foreground">
                New places are set to "Pending" status for review.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 'configure' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => startDiscovery(lat, lng)}
                disabled={selectedTypes.length === 0 || isSearching}
              >
                <Search className="h-4 w-4 mr-2" />
                Discover Places
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={startImport}
                disabled={selectedCount === 0 || isImporting || isScanningReviews}
              >
                Import {selectedCount} Places
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
