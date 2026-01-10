import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export const BlogImageUpload = ({ value, onChange }: BlogImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = async () => {
    if (value) {
      // Extract file path from URL for cleanup (optional)
      try {
        const url = new URL(value);
        const pathParts = url.pathname.split("/");
        const filePath = pathParts.slice(-2).join("/"); // covers/filename.ext
        await supabase.storage.from("blog-images").remove([filePath]);
      } catch {
        // Ignore cleanup errors
      }
    }
    onChange(null);
  };

  if (value) {
    return (
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="relative rounded-lg overflow-hidden border bg-muted/30">
          <img
            src={value}
            alt="Cover preview"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-3 right-3"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Image will appear as the hero for this announcement
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Cover Image (Optional)</Label>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-8 
          rounded-lg border-2 border-dashed cursor-pointer transition-colors
          ${isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
          }
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="p-3 rounded-full bg-muted/50">
              {isDragging ? (
                <Upload className="h-6 w-6 text-primary" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragging ? "Drop to upload" : "Click or drag to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP up to 5MB
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
