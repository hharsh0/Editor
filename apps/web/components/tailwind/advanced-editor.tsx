"use client";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
  ImageResizer,
} from "novel";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { useEffect, useRef, useState } from "react";
import type { Document } from "@/types";
import { Button } from "./ui/button";
import { MenuIcon, XIcon } from "lucide-react";


const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

interface TailwindAdvancedEditorProps {
  document: Document;
  onUpdate: (id: string, updates: Partial<Document>) => void;
}

const TailwindAdvancedEditor = ({ document, onUpdate }: TailwindAdvancedEditorProps) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    const html = editor.getHTML();
    const highlightedHtml = highlightCodeblocks(html);
    const markdown = editor.storage.markdown.getMarkdown();
    const wordsCount = editor.storage.characterCount.words();

    onUpdate(document.id, {
      content: json,
      htmlContent: highlightedHtml,
      markdown,
      wordsCount,
      saveStatus: "Saved"
    });
  }, 500);

  const hasHeadingNode = (editor: EditorInstance) => {
    let hasHeading = false;
    editor.state.doc.descendants((node) => {
      if (node.type.name.startsWith('heading')) {
        hasHeading = true;
        return false;
      }
      return true;
    });
    return hasHeading;
  };

  const ensureHeadingExists = (editor: EditorInstance) => {
    if (!hasHeadingNode(editor)) {
      editor.chain().insertContentAt(0, {
        type: 'heading',
        attrs: { level: 1 },
        content: []
      }).run();
    }
  };

  const updateTitleFromHeading = (editor: EditorInstance) => {
    let newTitle = "Untitled";

    editor.state.doc.descendants((node) => {
      if (node.type.name.startsWith("heading") && node.textContent.trim()) {
        newTitle = node.textContent.trim();
        return false;
      }
      return true;
    });

    onUpdate(document.id, { title: newTitle });
  };


  return (
    <div className="md:ml-64 flex-1 p-6">
      {/* Navigation Bar (Always Visible) */}
      {/* <nav className="md:ml-64 fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="flex justify-between items-center p-4">
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setIsFileManagerOpen(!isFileManagerOpen)}
            >
              {isFileManagerOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-semibold">My App</h1>
          </div>
        </nav> */}
      <div className="flex absolute right-10 top-10 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          {document.saveStatus}
        </div>
        <div className={document.wordsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {document.wordsCount} Words
        </div>
      </div>
      <EditorRoot>
      <EditorContent
          key={document.id}
          initialContent={document.content}
          extensions={extensions}
          className="relative min-h-[500px] w-full bg-background sm:mb-[calc(20vh)]"
          onCreate={({ editor }) => {
            editor.commands.focus();
            ensureHeadingExists(editor);
          }}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            onUpdate(document.id, { saveStatus: "Unsaved" });
            debouncedUpdates(editor);
            updateTitleFromHeading(editor);
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>        
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;