"use client";

import * as React from "react";
import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isUndocked?: boolean;
  onUndock?: () => void;
  onDock?: () => void;
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

const MenuBar = ({
  editor,
  isUndocked,
  onUndock,
  onDock,
}: {
  editor: Editor | null;
  isUndocked?: boolean;
  onUndock?: () => void;
  onDock?: () => void;
}) => {
  const editorState = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e)
        return {
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isBulletList: false,
          isOrderedList: false,
          isAlignLeft: false,
          isAlignCenter: false,
          isAlignRight: false,
          isLink: false,
          canBold: false,
          canItalic: false,
          canUnderline: false,
        };
      return {
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isUnderline: e.isActive("underline"),
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isAlignLeft: e.isActive({ textAlign: "left" }),
        isAlignCenter: e.isActive({ textAlign: "center" }),
        isAlignRight: e.isActive({ textAlign: "right" }),
        isLink: e.isActive("link"),
        canBold: e.can().chain().focus().toggleBold().run(),
        canItalic: e.can().chain().focus().toggleItalic().run(),
        canUnderline: e.can().chain().focus().toggleUnderline().run(),
      };
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    isActive: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      className={cn(
        "h-7 w-7 text-muted-foreground transition-all",
        isActive && "bg-muted text-foreground shadow-sm ring-1 ring-border/50",
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  const Divider = () => <div className="w-px h-4 bg-border mx-0.5" />;

  const handleSetLink = () => {
    const url = window.prompt(
      "Enter URL",
      editor.getAttributes("link").href ?? "https://",
    );
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/30 flex-wrap">
      {/* Basic formatting */}
      <ToolbarButton
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editorState?.isBold ?? false}
        disabled={!editorState?.canBold}
      >
        <Bold size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editorState?.isItalic ?? false}
        disabled={!editorState?.canItalic}
      >
        <Italic size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editorState?.isUnderline ?? false}
        disabled={!editorState?.canUnderline}
      >
        <UnderlineIcon size={13} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editorState?.isBulletList ?? false}
      >
        <List size={13} />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editorState?.isOrderedList ?? false}
      >
        <ListOrdered size={13} />
      </ToolbarButton>

      {/* Expanded toolbar — only shown when undocked */}
      {isUndocked && (
        <>
          <Divider />

          {/* Alignment */}
          <ToolbarButton
            title="Align left"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editorState?.isAlignLeft ?? false}
          >
            <AlignLeft size={13} />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editorState?.isAlignCenter ?? false}
          >
            <AlignCenter size={13} />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editorState?.isAlignRight ?? false}
          >
            <AlignRight size={13} />
          </ToolbarButton>

          <Divider />

          {/* Link */}
          <ToolbarButton
            title="Insert link"
            onClick={handleSetLink}
            isActive={editorState?.isLink ?? false}
          >
            <LinkIcon size={13} />
          </ToolbarButton>

          {/* Color picker */}
          <div className="relative flex items-center" title="Text color">
            <label className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer transition-colors">
              <span
                className="text-[11px] font-bold leading-none"
                style={{
                  color:
                    editor.getAttributes("textStyle").color ?? "currentColor",
                }}
              >
                A
              </span>
              <input
                type="color"
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
              />
            </label>
          </div>
        </>
      )}

      {/* Spacer + dock/undock button — only on md+ */}
      <div className="ml-auto hidden md:flex items-center">
        {isUndocked ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Dock editor"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDock}
          >
            <Minimize2 size={13} />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Expand editor"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onUndock}
          >
            <Maximize2 size={13} />
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Editor ─────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  disabled,
  isUndocked,
  onUndock,
  onDock,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "true",
      },
    },
    autofocus: "all",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);


  return (
    <div className="flex flex-col w-full">
      <MenuBar
        editor={editor}
        isUndocked={isUndocked}
        onUndock={onUndock}
        onDock={onDock}
      />
      <div
        className={cn(
          "w-full overflow-y-auto p-3 text-sm cursor-text",
          isUndocked ? "min-h-72" : "min-h-28 max-h-52",
          "[&_.tiptap]:outline-none",
          "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-1.5",
          "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-1.5",
          "[&_li]:mt-1 [&_li]:marker:text-muted-foreground",
          "[&_p]:m-0",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
