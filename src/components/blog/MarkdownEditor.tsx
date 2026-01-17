import { useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownToolbar } from "./MarkdownToolbar";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your content using Markdown...",
  rows = 8,
  className = ""
}: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback((prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      prefix + textToInsert + suffix + 
      value.substring(end);
    
    onChange(newValue);

    // Set cursor position after insertion
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [value, onChange]);

  return (
    <div className={className}>
      <MarkdownToolbar onInsert={handleInsert} />
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-t-none font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground mt-1.5">
        Use <code className="px-1 py-0.5 bg-muted rounded text-[10px]">## Heading</code> for sections, 
        <code className="px-1 py-0.5 bg-muted rounded text-[10px] ml-1">**bold**</code> for emphasis
      </p>
    </div>
  );
};
