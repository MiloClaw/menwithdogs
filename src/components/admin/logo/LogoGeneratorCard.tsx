import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Trash2 } from 'lucide-react';
import { useLogoGeneration } from '@/hooks/useLogoGeneration';

interface LogoGeneratorCardProps {
  sourceLogoUrl: string;
}

const PRESET_PROMPTS = [
  {
    label: "Clean Serif Text",
    prompt: "Redesign this logo with cleaner, more readable text using a classic serif font similar to Libre Baskerville or Playfair Display. Keep the text 'Men With Dogs' prominent and easy to read. Simplify the background - keep only essential mountain silhouettes and the central pine tree. Use clean lines and good contrast. Maintain the outdoor/nature theme with a refined, editorial aesthetic."
  },
  {
    label: "Minimal Icon + Text",
    prompt: "Create a minimal version of this logo with just the pine tree icon and the text 'Men With Dogs' in a clean serif font. Remove all background elements. The pine tree should be a simple, iconic silhouette. Text should be highly legible at small sizes. Use a horizontal layout suitable for a navbar."
  },
  {
    label: "Badge Style",
    prompt: "Redesign this logo as a contained badge or emblem style. Include 'Men With Dogs' text in a clean serif font within or below the badge. Simplify the mountain and tree imagery. Make it work well at both large and small sizes. Keep the outdoor adventure theme but with cleaner, more geometric shapes."
  }
];

const LogoGeneratorCard = ({ sourceLogoUrl }: LogoGeneratorCardProps) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const { isGenerating, generatedLogos, generateLogo, clearLogos } = useLogoGeneration();

  // Convert local image to base64 data URL
  const getBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim()) return;
    try {
      // Convert the source image to base64 so the AI gateway can read it
      const base64Url = await getBase64FromUrl(sourceLogoUrl);
      await generateLogo(base64Url, prompt);
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thicktimber-logo-variant-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Generate Improved Variants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Prompts */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handleGenerate(preset.prompt)}
                disabled={isGenerating}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Or describe your changes:</p>
          <Textarea
            placeholder="E.g., Make the text larger and use a bold serif font. Remove the mountains and keep only the pine tree..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={() => handleGenerate(customPrompt)}
            disabled={isGenerating || !customPrompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Custom Variant
              </>
            )}
          </Button>
        </div>

        {/* Generated Logos */}
        {generatedLogos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Generated Variants ({generatedLogos.length})</p>
              <Button variant="ghost" size="sm" onClick={clearLogos}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedLogos.map((logo, index) => (
                <div key={logo.timestamp} className="relative group">
                  <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[150px]">
                    <img
                      src={logo.imageUrl}
                      alt={`Generated variant ${index + 1}`}
                      className="max-h-32 w-auto object-contain"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(logo.imageUrl, index)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {logo.prompt.substring(0, 50)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            <li>Be specific about font style, layout, and which elements to keep/remove</li>
            <li>Mention "Libre Baskerville" or "classic serif" for website font matching</li>
            <li>Download variants you like and replace the logo asset in the codebase</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoGeneratorCard;
