import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedLogo {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export const useLogoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateLogo = async (sourceImageUrl: string, prompt: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-logo-variant', {
        body: { imageUrl: sourceImageUrl, prompt }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate logo');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.imageUrl) {
        const newLogo: GeneratedLogo = {
          imageUrl: data.imageUrl,
          prompt,
          timestamp: Date.now()
        };
        setGeneratedLogos(prev => [newLogo, ...prev]);
        toast.success('Logo variant generated!');
        return newLogo;
      } else {
        throw new Error(data.textResponse || 'No image generated');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate logo';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearLogos = () => {
    setGeneratedLogos([]);
  };

  return {
    isGenerating,
    generatedLogos,
    error,
    generateLogo,
    clearLogos
  };
};
