import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Loader2, QrCode } from 'lucide-react';

interface SessionJoinProps {
  onJoin: (token: string) => void;
  onCreateNew: () => void;
  isJoining: boolean;
  isCreating: boolean;
  initialToken?: string;
}

export function SessionJoin({ 
  onJoin, 
  onCreateNew, 
  isJoining, 
  isCreating,
  initialToken = '' 
}: SessionJoinProps) {
  const [token, setToken] = useState(initialToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim().length >= 6) {
      onJoin(token.trim().toUpperCase());
    }
  };

  const handleTokenChange = (value: string) => {
    // Only allow alphanumeric, max 6 chars
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setToken(cleaned);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Create New Session Card */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Generate a Session</CardTitle>
          <CardDescription>
            Create a QR code for someone else to scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onCreateNew} 
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Create Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or join existing
          </span>
        </div>
      </div>

      {/* Join Session Card */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-2">
            <Users className="h-6 w-6 text-secondary-foreground" />
          </div>
          <CardTitle className="text-xl">Enter a Code</CardTitle>
          <CardDescription>
            Join someone else's session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="ABCD12"
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="text-center font-mono text-xl tracking-widest h-12"
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
            />
            <Button 
              type="submit" 
              variant="secondary"
              className="w-full"
              disabled={token.length < 6 || isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Session'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
