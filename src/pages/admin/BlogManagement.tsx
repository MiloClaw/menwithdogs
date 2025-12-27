import { useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BlogManagement = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post. ' + error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Post deleted',
        description: 'The blog post has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts</p>
          </div>
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Posts Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading posts...
              </div>
            ) : !posts || posts.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No blog posts yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs">
                        <span className="line-clamp-1">{post.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {post.is_featured ? (
                          <Badge variant="secondary">Featured</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Standard</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(post.published_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {post.reading_time} min
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={deletingId === post.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{post.title}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(post.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Placeholder */}
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Blog post editor coming in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BlogManagement;
