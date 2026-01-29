import { MessageSquare, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePlaceTrailBlazerContext } from '@/hooks/usePlaceTrailBlazerContext';
import { getContextTypeLabel } from '@/lib/context-type-options';

interface PlaceTrailBlazerContextProps {
  placeId: string;
}

const PlaceTrailBlazerContext = ({ placeId }: PlaceTrailBlazerContextProps) => {
  const { contexts, isLoading, hasContext } = usePlaceTrailBlazerContext(placeId);

  // Don't render anything while loading or if no approved context
  if (isLoading || !hasContext) {
    return null;
  }

  return (
    <>
      <Separator />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium text-base">Local Insight</h3>
        </div>

        {/* Render each approved context entry */}
        {contexts.map((context) => (
          <div key={context.id} className="space-y-3">
            {/* Context type badges */}
            {context.context_types && context.context_types.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {context.context_types.map((type) => (
                  <Badge 
                    key={type} 
                    variant="secondary" 
                    className="text-xs font-normal"
                  >
                    {getContextTypeLabel(type)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Context text */}
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {context.context_text}
            </p>

            {/* External link (if approved with link) */}
            {context.has_external_link && context.external_url && (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <a
                    href={context.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {(() => {
                      try {
                        return new URL(context.external_url).hostname;
                      } catch {
                        return context.external_url;
                      }
                    })()}
                  </a>
                  {context.external_summary && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {context.external_summary}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PlaceTrailBlazerContext;
