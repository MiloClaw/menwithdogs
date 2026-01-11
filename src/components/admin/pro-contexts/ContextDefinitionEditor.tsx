import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ContextDefinition {
  id: string;
  key: string;
  domain: string;
  description: string | null;
  is_sensitive: boolean;
  default_confidence_cap: number;
  is_active: boolean;
  created_at: string;
}

const DOMAINS = ['demographic', 'community', 'lifestyle', 'faith', 'activity'];

/**
 * Admin editor for pro_context_definitions.
 * 
 * Admins can:
 * - Create new context definitions
 * - Edit description, is_active, default_confidence_cap
 * - View context keys
 * 
 * Admins CANNOT:
 * - See which users selected a context
 * - See per-user counts
 */
export function ContextDefinitionEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    domain: 'lifestyle',
    description: '',
    is_sensitive: false,
    default_confidence_cap: 0.25,
    is_active: true,
  });

  // Fetch definitions
  const { data: definitions = [], isLoading } = useQuery({
    queryKey: ['admin-context-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_context_definitions')
        .select('*')
        .order('domain')
        .order('key');

      if (error) throw error;
      return data as ContextDefinition[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('pro_context_definitions')
        .insert({
          key: data.key.toLowerCase().replace(/\s+/g, '_'),
          domain: data.domain,
          description: data.description || null,
          is_sensitive: data.is_sensitive,
          default_confidence_cap: data.default_confidence_cap,
          is_active: data.is_active,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Context created' });
      queryClient.invalidateQueries({ queryKey: ['admin-context-definitions'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error creating context', description: String(error), variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<typeof formData>) => {
      const { error } = await supabase
        .from('pro_context_definitions')
        .update({
          description: data.description || null,
          is_sensitive: data.is_sensitive,
          default_confidence_cap: data.default_confidence_cap,
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Context updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-context-definitions'] });
      setEditingId(null);
    },
    onError: (error) => {
      toast({ title: 'Error updating context', description: String(error), variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pro_context_definitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Context deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-context-definitions'] });
    },
    onError: (error) => {
      toast({ title: 'Error deleting context', description: String(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      key: '',
      domain: 'lifestyle',
      description: '',
      is_sensitive: false,
      default_confidence_cap: 0.25,
      is_active: true,
    });
  };

  const startEdit = (def: ContextDefinition) => {
    setEditingId(def.id);
    setFormData({
      key: def.key,
      domain: def.domain,
      description: def.description || '',
      is_sensitive: def.is_sensitive,
      default_confidence_cap: def.default_confidence_cap,
      is_active: def.is_active,
    });
  };

  const groupedByDomain = definitions.reduce((acc, def) => {
    if (!acc[def.domain]) acc[def.domain] = [];
    acc[def.domain].push(def);
    return acc;
  }, {} as Record<string, ContextDefinition[]>);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Define context options that Pro users can select to personalize recommendations.
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Context
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Context Definition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Key (stable identifier)</Label>
                <Input
                  placeholder="e.g., dog_owner, outdoor_enthusiast"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={formData.domain} onValueChange={(v) => setFormData({ ...formData, domain: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (admin-only)</Label>
                <Textarea
                  placeholder="Internal notes about this context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sensitive (requires k=20)</Label>
                <Switch
                  checked={formData.is_sensitive}
                  onCheckedChange={(v) => setFormData({ ...formData, is_sensitive: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confidence Cap (max 0.3)</Label>
                <Input
                  type="number"
                  min={0}
                  max={0.3}
                  step={0.05}
                  value={formData.default_confidence_cap}
                  onChange={(e) => setFormData({ ...formData, default_confidence_cap: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.key || createMutation.isPending}
              >
                Create Context
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Definitions by domain */}
      {DOMAINS.map((domain) => {
        const defs = groupedByDomain[domain] || [];
        if (defs.length === 0) return null;

        return (
          <Card key={domain}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">{domain}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {defs.map((def) => (
                <div
                  key={def.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{def.key}</span>
                        {def.is_sensitive && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Sensitive
                          </Badge>
                        )}
                        {!def.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {def.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(def)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(def.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {definitions.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No context definitions yet. Create one to get started.
        </p>
      )}

      {/* Edit dialog */}
      {editingId && (
        <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Context: {formData.key}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Description (admin-only)</Label>
                <Textarea
                  placeholder="Internal notes about this context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sensitive (requires k=20)</Label>
                <Switch
                  checked={formData.is_sensitive}
                  onCheckedChange={(v) => setFormData({ ...formData, is_sensitive: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confidence Cap (max 0.3)</Label>
                <Input
                  type="number"
                  min={0}
                  max={0.3}
                  step={0.05}
                  value={formData.default_confidence_cap}
                  onChange={(e) => setFormData({ ...formData, default_confidence_cap: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => updateMutation.mutate({ id: editingId, ...formData })}
                disabled={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ContextDefinitionEditor;
