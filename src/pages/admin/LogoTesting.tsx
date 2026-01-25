import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Menu, Heart, Settings, LogOut } from 'lucide-react';
import logoConcept1 from '@/assets/logo-concept-1.png';
import LogoGeneratorCard from '@/components/admin/logo/LogoGeneratorCard';

const LogoTesting = () => {
  const [logoHeight, setLogoHeight] = useState(40);
  const [invertOnDark, setInvertOnDark] = useState(true);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl">
        <PageHeader 
          title="Logo Testing" 
          subtitle="Preview and test logo concepts before deployment"
        />

        {/* Raw Logo Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Concept 1: Mountain Pine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-lg border flex items-center justify-center min-h-[200px]">
                <img 
                  src={logoConcept1} 
                  alt="Logo on light background" 
                  className="max-h-32 w-auto"
                />
              </div>
              <div className="bg-[hsl(213,52%,12%)] p-8 rounded-lg flex items-center justify-center min-h-[200px]">
                <img 
                  src={logoConcept1} 
                  alt="Logo on dark background" 
                  className={`max-h-32 w-auto ${invertOnDark ? 'invert brightness-200' : ''}`}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Switch 
                id="invert" 
                checked={invertOnDark} 
                onCheckedChange={setInvertOnDark}
              />
              <Label htmlFor="invert" className="text-sm text-muted-foreground">
                Invert colors on dark background
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* AI Logo Generator */}
        <LogoGeneratorCard sourceLogoUrl={logoConcept1} />

        {/* Size Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Size Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Label className="w-24 text-sm">Height: {logoHeight}px</Label>
              <Slider
                value={[logoHeight]}
                onValueChange={(v) => setLogoHeight(v[0])}
                min={24}
                max={80}
                step={4}
                className="flex-1 max-w-xs"
              />
            </div>
            <div className="flex items-end gap-8 flex-wrap">
              {[24, 32, 40, 48, 64].map((size) => (
                <div key={size} className="text-center">
                  <img 
                    src={logoConcept1} 
                    alt={`Logo at ${size}px`}
                    style={{ height: size }}
                    className="w-auto"
                  />
                  <p className="text-xs text-muted-foreground mt-2">{size}px</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navbar Preview - Light */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navbar Preview (Light)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Desktop Navbar */}
            <div className="bg-background border rounded-lg">
              <div className="flex items-center justify-between h-16 px-4">
                <img 
                  src={logoConcept1} 
                  alt="Logo in navbar"
                  style={{ height: logoHeight }}
                  className="w-auto"
                />
                <div className="hidden md:flex items-center gap-6">
                  <span className="text-sm font-medium text-primary">Places</span>
                  <span className="text-sm font-medium text-muted-foreground">How It Works</span>
                  <span className="text-sm font-medium text-muted-foreground">Sign In</span>
                </div>
                <Menu className="md:hidden w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Mobile Navbar */}
            <div className="bg-background border rounded-lg max-w-[375px]">
              <div className="flex items-center justify-between h-14 px-4">
                <img 
                  src={logoConcept1} 
                  alt="Logo in mobile navbar"
                  style={{ height: Math.min(logoHeight, 32) }}
                  className="w-auto"
                />
                <Menu className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navbar Preview - Dark */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navbar Preview (Dark)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[hsl(213,52%,12%)] rounded-lg">
              <div className="flex items-center justify-between h-16 px-4">
                <img 
                  src={logoConcept1} 
                  alt="Logo in dark navbar"
                  style={{ height: logoHeight }}
                  className={`w-auto ${invertOnDark ? 'invert brightness-200' : ''}`}
                />
                <div className="hidden md:flex items-center gap-6">
                  <span className="text-sm font-medium text-white/90">Places</span>
                  <span className="text-sm font-medium text-white/60">How It Works</span>
                  <span className="text-sm font-medium text-white/60">Sign In</span>
                </div>
                <Menu className="md:hidden w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Footer Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Light Footer */}
            <div className="bg-muted/50 rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <img 
                  src={logoConcept1} 
                  alt="Logo in footer"
                  style={{ height: Math.min(logoHeight, 48) }}
                  className="w-auto"
                />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Terms</span>
                  <span>Privacy</span>
                  <span>About</span>
                </div>
              </div>
            </div>

            {/* Dark Footer */}
            <div className="bg-[hsl(213,52%,12%)] rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <img 
                  src={logoConcept1} 
                  alt="Logo in dark footer"
                  style={{ height: Math.min(logoHeight, 48) }}
                  className={`w-auto ${invertOnDark ? 'invert brightness-200' : ''}`}
                />
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>Terms</span>
                  <span>Privacy</span>
                  <span>About</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon/Favicon Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Icon / Favicon Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              For favicon, consider cropping to just the central pine tree element.
            </p>
            <div className="flex items-end gap-6">
              {[16, 32, 48, 64].map((size) => (
                <div key={size} className="text-center">
                  <div 
                    className="bg-muted rounded border flex items-center justify-center overflow-hidden"
                    style={{ width: size, height: size }}
                  >
                    <img 
                      src={logoConcept1} 
                      alt={`Icon at ${size}px`}
                      className="w-[200%] h-auto object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{size}px</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Authenticated User Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Authenticated User Navbar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background border rounded-lg">
              <div className="flex items-center justify-between h-16 px-4">
                <img 
                  src={logoConcept1} 
                  alt="Logo in navbar"
                  style={{ height: logoHeight }}
                  className="w-auto"
                />
                <div className="hidden md:flex items-center gap-4">
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <Settings className="w-4 h-4" /> Settings
                  </span>
                  <span className="text-sm font-medium text-primary">Places</span>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <Heart className="w-4 h-4" /> Saved
                  </span>
                  <button className="text-sm font-medium border px-3 py-1.5 rounded flex items-center gap-1">
                    Sign Out <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <Menu className="md:hidden w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Recommended navbar height:</strong> 32-40px for mobile, 40-48px for desktop</p>
            <p>• <strong>Footer:</strong> Can be slightly larger (48-64px) as a brand anchor</p>
            <p>• <strong>Favicon:</strong> Will need a cropped version focusing on the pine tree</p>
            <p>• <strong>Dark mode:</strong> Consider creating a separate inverted/white version</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default LogoTesting;
