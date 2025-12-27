import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
    <PageLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Blog Management</h1>
              <p className="text-muted-foreground">Create and manage blog posts</p>
            </div>
          </div>
        </div>

        <Card className="mb-6 border-dashed">
          <CardContent className="py-6 text-center">
            <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Blog post editor coming in a future update.
              <br />
              For now, create posts via database.
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading posts...
          </div>
        ) : !posts || posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No blog posts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        {post.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base line-clamp-1">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {new Date(post.published_at).toLocaleDateString()} · {post.reading_time} min read
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
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
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default BlogManagement;
