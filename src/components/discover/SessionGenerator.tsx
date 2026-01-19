import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, X, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface SessionGeneratorProps {
  token: string;
  expiresAt: string;
  onCancel: () => void;
  isCancelling: boolean;
}

export function SessionGenerator({ token, expiresAt, onCancel, isCancelling }: SessionGeneratorProps) {
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/together/${token}`;
  
  const copyCode = () => {
    navigator.clipboard.writeText(token);
    toast.success('Code copied to clipboard');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const shareSession = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Discover Together',
          text: `Join me to discover places together! Use code: ${token}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const expiresDate = new Date(expiresAt);
  const hoursRemaining = Math.max(0, Math.round((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Waiting for partner...</CardTitle>
        <CardDescription>
          Share this code or scan the QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QRCodeSVG 
              value={shareUrl} 
              size={180}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Code Display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Or enter this code:</p>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-xl font-mono text-2xl font-bold tracking-widest hover:bg-muted/80 transition-colors"
          >
            {token}
            <Copy className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Share Button */}
        <Button 
          onClick={shareSession} 
          variant="outline" 
          className="w-full"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Link
        </Button>

        {/* Expiry Notice */}
        <p className="text-xs text-center text-muted-foreground">
          Session expires in {hoursRemaining} hours
        </p>

        {/* Cancel Button */}
        <Button 
          onClick={onCancel} 
          variant="ghost" 
          className="w-full text-destructive hover:text-destructive"
          disabled={isCancelling}
        >
          {isCancelling ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Cancel Session
        </Button>
      </CardContent>
    </Card>
  );
}
