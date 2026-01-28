import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, LinkIcon, FileText, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { AmbassadorWithPermission } from '@/hooks/useTrailBlazerPermissions';

interface PermissionsPaneProps {
  ambassadors: AmbassadorWithPermission[];
  loading: boolean;
  onToggleExternalLinks: (userId: string, enabled: boolean) => Promise<{ success: boolean }>;
  onUpdateNotes: (userId: string, notes: string) => Promise<{ success: boolean }>;
}

export function PermissionsPane({
  ambassadors,
  loading,
  onToggleExternalLinks,
  onUpdateNotes,
}: PermissionsPaneProps) {
  const [search, setSearch] = useState('');
  const [editingNotes, setEditingNotes] = useState<{ userId: string; notes: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = ambassadors.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.email.toLowerCase().includes(q) ||
      (a.name?.toLowerCase().includes(q))
    );
  });

  const handleToggle = async (userId: string, enabled: boolean) => {
    await onToggleExternalLinks(userId, enabled);
  };

  const handleSaveNotes = async () => {
    if (!editingNotes) return;
    setSaving(true);
    await onUpdateNotes(editingNotes.userId, editingNotes.notes);
    setSaving(false);
    setEditingNotes(null);
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div>
          <h3 className="font-medium">Trail Blazer Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Manage capabilities for approved Trail Blazers
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {ambassadors.length === 0 
              ? 'No approved Trail Blazers yet'
              : 'No matching Trail Blazers'
            }
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trail Blazer</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    External Links
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ambassador => (
                <TableRow key={ambassador.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{ambassador.name || 'Unnamed'}</div>
                        <div className="text-xs text-muted-foreground">{ambassador.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ambassador.approved_at && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ambassador.approved_at), 'MMM d, yyyy')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={ambassador.permission?.can_attach_external_links ?? false}
                      onCheckedChange={(checked) => handleToggle(ambassador.user_id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNotes({
                        userId: ambassador.user_id,
                        notes: ambassador.permission?.notes || '',
                      })}
                    >
                      <FileText className="h-4 w-4" />
                      {ambassador.permission?.notes && (
                        <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Notes Dialog */}
      <Dialog open={!!editingNotes} onOpenChange={(open) => !open && setEditingNotes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permission Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Admin notes about this Trail Blazer's permissions..."
            value={editingNotes?.notes || ''}
            onChange={e => setEditingNotes(prev => prev ? { ...prev, notes: e.target.value } : null)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotes(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={saving}>
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
