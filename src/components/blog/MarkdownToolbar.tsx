import { Bold, Italic, Heading2, Heading3, List, Quote, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, placeholder?: string) => void;
}

export const MarkdownToolbar = ({ onInsert }: MarkdownToolbarProps) => {
  const tools = [
    { icon: Heading2, label: "Heading 2", prefix: "## ", suffix: "", placeholder: "Heading" },
    { icon: Heading3, label: "Heading 3", prefix: "### ", suffix: "", placeholder: "Subheading" },
    { icon: Bold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
    { icon: Italic, label: "Italic", prefix: "_", suffix: "_", placeholder: "italic text" },
    { icon: List, label: "Bullet List", prefix: "- ", suffix: "", placeholder: "List item" },
    { icon: Quote, label: "Blockquote", prefix: "> ", suffix: "", placeholder: "Quote" },
    { icon: Link2, label: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
  ];

  return (
    <div className="flex items-center gap-0.5 p-1 bg-muted/50 rounded-t-md border border-b-0">
      {tools.map(({ icon: Icon, label, prefix, suffix, placeholder }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onInsert(prefix, suffix, placeholder)}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
