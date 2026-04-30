"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  // Reusable button component to keep things clean and apply the focus fix everywhere
  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    disabled, 
    children 
  }: { 
    onClick: () => void; 
    isActive: boolean; 
    disabled?: boolean; 
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 text-muted-foreground transition-all",
        isActive && "bg-muted text-foreground shadow-sm ring-1 ring-border/50"
      )}
      // 🚨 THE MAGIC FIX: Prevents the button from stealing focus from the editor!
      onMouseDown={(e) => e.preventDefault()} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex items-center gap-1 p-1.5 border-b bg-muted/30">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold size={14} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic size={14} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={14} />
      </ToolbarButton>
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      >
        <List size={14} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      >
        <ListOrdered size={14} />
      </ToolbarButton>
    </div>
  );
};

export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions:[
      StarterKit.configure({
        // Disable native tiptap headings if you just want simple text
        heading: false, 
      }),
      Underline,
    ],
    content: value,
    editable: !disabled,
    // Add this line right here to fix the SSR crash:
    immediatelyRender: false, 
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });


  // Sync external value changes (like when you clear the editor after sending)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col w-full">
      <MenuBar editor={editor} />
      {/* 
        Tailwind resets lists globally. 
        These arbitrary variants `[&_ul]` ensure lists render correctly inside the editor. 
      */}
      <div className={cn(
        "w-full min-h-30 max-h-75 overflow-y-auto p-3 text-sm cursor-text",
        "[&_.tiptap]:outline-none", // Removes the blue focus ring from the inner editor
        
        // UN-RESET LISTS (Fixes the invisible bullets)
        "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-1.5",
        "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-1.5",
        
        // BETTER LIST STYLING (Pro touch)
        "[&_li]:mt-1 [&_li]:marker:text-muted-foreground",
        
        // RESET PARAGRAPHS (Tiptap wraps everything in <p>, which messes up spacing)
        "[&_p]:m-0",
        
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}