import { useState, lazy, Suspense } from 'react';
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
import { Plus, Pencil, Trash2, Shield, Eye, Layers, Check, icons, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

// Dynamic icon component for preview
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = icons[name as keyof typeof icons] as LucideIcon | undefined;
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

interface ContextDefinition {
  id: string;
  key: string;
  domain: string;
  description: string | null;
  is_sensitive: boolean | null;
  default_confidence_cap: number;
  is_active: boolean | null;
  created_at: string | null;
  // UI metadata columns
  step: number | null;
  section: string | null;
  label: string | null;
  icon: string | null;
  input_type: string | null;
  influence_mode: string;
  sort_order: number | null;
  show_condition: Json | null;
}

const DOMAINS = ['about', 'comfort', 'intent', 'style'];
const STEPS = [1, 2, 3, 4];
const INPUT_TYPES = ['single', 'multi'];
const INFLUENCE_MODES = ['boost', 'overlap', 'neutral'];

// Sections mapped by step for easier UI
const SECTIONS_BY_STEP: Record<number, string[]> = {
  1: ['identity', 'relationship_context'],
  2: ['community'],
  3: ['intent'],
  4: ['energy', 'environment', 'timing'],
};

/**
 * Admin editor for pro_context_definitions.
 * 
 * Admins can:
 * - Create new context definitions with full UI metadata
 * - Edit all fields including step, section, label, icon, show_condition
 * - View context keys and their configuration
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

  // Form state with all fields
  const [formData, setFormData] = useState({
    key: '',
    domain: 'comfort',
    description: '',
    is_sensitive: false,
    default_confidence_cap: 0.25,
    is_active: true,
    // UI metadata
    step: 2,
    section: 'community',
    label: '',
    icon: '',
    input_type: 'multi',
    influence_mode: 'boost',
    sort_order: 100,
    show_condition: '',
  });

  // Fetch definitions
  const { data: definitions = [], isLoading } = useQuery({
    queryKey: ['admin-context-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_context_definitions')
        .select('*')
        .order('step')
        .order('section')
        .order('sort_order');

      if (error) throw error;
      return data as ContextDefinition[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let showConditionJson: Json = null;
      if (data.show_condition) {
        try {
          showConditionJson = JSON.parse(data.show_condition);
        } catch {
          throw new Error('Invalid JSON in show_condition');
        }
      }

      const { error } = await supabase
        .from('pro_context_definitions')
        .insert({
          key: data.key.toLowerCase().replace(/\s+/g, '_'),
          domain: data.domain,
          description: data.description || null,
          is_sensitive: data.is_sensitive,
          default_confidence_cap: data.default_confidence_cap,
          is_active: data.is_active,
          step: data.step,
          section: data.section || null,
          label: data.label || null,
          icon: data.icon || null,
          input_type: data.input_type,
          influence_mode: data.influence_mode,
          sort_order: data.sort_order,
          show_condition: showConditionJson,
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
      let showConditionJson: Json = null;
      if (data.show_condition) {
        try {
          showConditionJson = JSON.parse(data.show_condition);
        } catch {
          throw new Error('Invalid JSON in show_condition');
        }
      }

      const { error } = await supabase
        .from('pro_context_definitions')
        .update({
          description: data.description || null,
          is_sensitive: data.is_sensitive,
          default_confidence_cap: data.default_confidence_cap,
          is_active: data.is_active,
          step: data.step,
          section: data.section || null,
          label: data.label || null,
          icon: data.icon || null,
          input_type: data.input_type,
          influence_mode: data.influence_mode,
          sort_order: data.sort_order,
          show_condition: showConditionJson,
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
      domain: 'comfort',
      description: '',
      is_sensitive: false,
      default_confidence_cap: 0.25,
      is_active: true,
      step: 2,
      section: 'community',
      label: '',
      icon: '',
      input_type: 'multi',
      influence_mode: 'boost',
      sort_order: 100,
      show_condition: '',
    });
  };

  const startEdit = (def: ContextDefinition) => {
    setEditingId(def.id);
    setFormData({
      key: def.key,
      domain: def.domain,
      description: def.description || '',
      is_sensitive: def.is_sensitive ?? false,
      default_confidence_cap: def.default_confidence_cap,
      is_active: def.is_active ?? true,
      step: def.step ?? 2,
      section: def.section || '',
      label: def.label || '',
      icon: def.icon || '',
      input_type: def.input_type || 'multi',
      influence_mode: def.influence_mode || 'boost',
      sort_order: def.sort_order ?? 100,
      show_condition: def.show_condition ? JSON.stringify(def.show_condition, null, 2) : '',
    });
  };

  // Group by step for better organization
  const groupedByStep = definitions.reduce((acc, def) => {
    const step = def.step ?? 0;
    if (!acc[step]) acc[step] = [];
    acc[step].push(def);
    return acc;
  }, {} as Record<number, ContextDefinition[]>);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const FormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="ui">UI Metadata</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 pt-4">
        {!isEdit && (
          <div className="space-y-2">
            <Label>Key (stable identifier)</Label>
            <Input
              placeholder="e.g., lgbtq_friendly, dog_owner"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Lowercase, underscores. Cannot be changed after creation.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
            <Label>Influence Mode</Label>
            <Select value={formData.influence_mode} onValueChange={(v) => setFormData({ ...formData, influence_mode: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INFLUENCE_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              boost = affects rankings, overlap = couple overlap modeling only, neutral = no effect
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description (admin-only)</Label>
          <Textarea
            placeholder="Internal notes about this context..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Confidence Cap</Label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={formData.default_confidence_cap}
              onChange={(e) => setFormData({ ...formData, default_confidence_cap: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input
              type="number"
              min={0}
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label>Sensitive</Label>
            <p className="text-xs text-muted-foreground">Requires k=20 for density visibility</p>
          </div>
          <Switch
            checked={formData.is_sensitive}
            onCheckedChange={(v) => setFormData({ ...formData, is_sensitive: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Active</Label>
            <p className="text-xs text-muted-foreground">Inactive options are hidden from users</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
          />
        </div>
      </TabsContent>

      <TabsContent value="ui" className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Step (1-4)</Label>
            <Select 
              value={formData.step.toString()} 
              onValueChange={(v) => {
                const step = parseInt(v);
                const sections = SECTIONS_BY_STEP[step] || [];
                setFormData({ 
                  ...formData, 
                  step,
                  section: sections[0] || ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEPS.map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    Step {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              1=About You, 2=Comfort, 3=Intent, 4=Style
            </p>
          </div>

          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={formData.section} onValueChange={(v) => setFormData({ ...formData, section: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {(SECTIONS_BY_STEP[formData.step] || []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Label (user-facing)</Label>
          <Input
            placeholder="e.g., LGBTQ+ Friendly, Dog Owner"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Display text shown to users. Falls back to formatted key if empty.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Icon (Lucide name)</Label>
            <Input
              placeholder="e.g., Heart, Users, Coffee"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Use Lucide icon names.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Input Type</Label>
            <Select value={formData.input_type} onValueChange={(v) => setFormData({ ...formData, input_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INPUT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === 'single' ? 'Single Select' : 'Multi Select'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Show Condition (JSON)</Label>
          <Textarea
            placeholder='{"field": "about.in_relationship", "value": true, "operator": "eq"}'
            value={formData.show_condition}
            onChange={(e) => setFormData({ ...formData, show_condition: e.target.value })}
            className="font-mono text-sm"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Optional. JSON object to conditionally show this option based on other selections.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="space-y-6 pt-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Chip Preview</Label>
            <p className="text-xs text-muted-foreground mb-3">
              How this option will appear in the Pro Settings flow
            </p>
          </div>

          {/* Preview states */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Unselected State
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full min-h-[44px] px-4 gap-2 cursor-default"
                  type="button"
                >
                  {formData.icon && <DynamicIcon name={formData.icon} className="h-4 w-4" />}
                  <span>{formData.label || formData.key || 'Option Label'}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Selected State
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    'rounded-full min-h-[44px] px-4 gap-2 cursor-default',
                    'ring-2 ring-primary/20 ring-offset-1'
                  )}
                  type="button"
                >
                  {formData.icon && <DynamicIcon name={formData.icon} className="h-4 w-4" />}
                  <span>{formData.label || formData.key || 'Option Label'}</span>
                  <Check className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Context info */}
          <Separator />
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Step:</span>
              <span className="font-medium">Step {formData.step}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Section:</span>
              <span className="font-medium capitalize">{formData.section?.replace(/_/g, ' ') || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input Type:</span>
              <span className="font-medium">{formData.input_type === 'single' ? 'Single Select' : 'Multi Select'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Influence:</span>
              <Badge variant={formData.influence_mode === 'boost' ? 'default' : 'secondary'}>
                {formData.influence_mode}
              </Badge>
            </div>
            {formData.show_condition && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Conditional:</span>
                <Badge variant="outline" className="max-w-[200px] truncate">
                  <Eye className="h-3 w-3 mr-1" />
                  Has condition
                </Badge>
              </div>
            )}
          </div>

          {/* Icon helper */}
          {!formData.icon && (
            <div className="p-3 rounded-lg border border-dashed bg-muted/10">
              <p className="text-xs text-muted-foreground text-center">
                💡 Add an icon name in UI Metadata tab (e.g., Heart, Users, Coffee)
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );

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
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create Context Definition</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <FormFields />
              <Button
                className="w-full mt-6"
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.key || createMutation.isPending}
              >
                Create Context
              </Button>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Definitions by step */}
      {STEPS.map((step) => {
        const defs = groupedByStep[step] || [];
        if (defs.length === 0) return null;

        const stepLabels: Record<number, string> = {
          1: 'Step 1: About You',
          2: 'Step 2: Comfort',
          3: 'Step 3: Intent',
          4: 'Step 4: Style',
        };

        // Group by section within step
        const bySection = defs.reduce((acc, def) => {
          const section = def.section || 'other';
          if (!acc[section]) acc[section] = [];
          acc[section].push(def);
          return acc;
        }, {} as Record<string, ContextDefinition[]>);

        return (
          <Card key={step}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {stepLabels[step]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(bySection).map(([section, sectionDefs]) => (
                <div key={section} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {section.replace(/_/g, ' ')}
                  </p>
                  {sectionDefs.map((def) => (
                    <div
                      key={def.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{def.label || def.key}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {def.key}
                            </Badge>
                            {def.is_sensitive && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                <Shield className="h-3 w-3 mr-1" />
                                Sensitive
                              </Badge>
                            )}
                            {def.influence_mode === 'overlap' && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Overlap only
                              </Badge>
                            )}
                            {!def.is_active && (
                              <Badge variant="secondary" className="text-xs shrink-0">Inactive</Badge>
                            )}
                            {def.show_condition && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                <Eye className="h-3 w-3 mr-1" />
                                Conditional
                              </Badge>
                            )}
                          </div>
                          {def.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{def.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Ungrouped (no step) */}
      {groupedByStep[0]?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground">Uncategorized</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedByStep[0].map((def) => (
              <div
                key={def.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{def.label || def.key}</span>
                      <Badge variant="outline" className="text-xs">{def.key}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(def)}>
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
      )}

      {definitions.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No context definitions yet. Create one to get started.
        </p>
      )}

      {/* Edit dialog */}
      {editingId && (
        <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Context: {formData.key}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <FormFields isEdit />
              <Button
                className="w-full mt-6"
                onClick={() => updateMutation.mutate({ id: editingId, ...formData })}
                disabled={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ContextDefinitionEditor;
