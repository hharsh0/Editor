"use client";

import FileManager from "@/components/file-system/file-manager";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/tailwind/ui/dialog";
import Menu from "@/components/tailwind/ui/menu";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";
import { defaultEditorContent } from "@/lib/content";
import { BookOpen, GithubIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Document = {
  id: string;
  name: string;
  content: any;
  saveStatus: string;
  wordsCount: number;
  htmlContent: string;
  markdown: string;
  isRenaming?: boolean;
  icon?: string;
};


export default function Page() {

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem("documents");
    if (savedDocuments) {
      const parsedDocs = JSON.parse(savedDocuments);
      setDocuments(parsedDocs);
      setActiveDocumentId(parsedDocs[0]?.id || null);
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(documents));
  }, [documents]);

  const createNewDocument = () => {
    const newDoc = {
      id: Date.now().toString(),
      name: `Untitled ${documents.length + 1}`,
      // content: { type: "doc", content: [] },
      content: {defaultEditorContent},
      htmlContent: "",
      markdown: "",
      saveStatus: "Unsaved",
      wordsCount: 0,
      icon: "📄" 
    };
    
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => {
      const newDocs = prev.filter(doc => doc.id !== id);
      // If we deleted the active document, clear the active ID
      if (activeDocumentId === id) {
        setActiveDocumentId(newDocs.length > 0 ? newDocs[0].id : null);
      }
      return newDocs;
    });
  };

  const handleRenameDocument = (id: string, newName: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id 
          ? { ...doc, name: newName, isRenaming: false } 
          : doc
      )
    );
  };

  const startRenaming = (id: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id 
          ? { ...doc, isRenaming: true } 
          : { ...doc, isRenaming: false }
      )
    );
  };

  const handleIconChange = (id: string, icon: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, icon } : doc
      )
    );
  };


  return (
    <div className="flex min-h-screen">
      {/* <FileManager  />
      <TailwindAdvancedEditor /> */}
       <FileManager 
        documents={documents}
        activeDocumentId={activeDocumentId}
        onDocumentSelect={setActiveDocumentId}
        onCreateNew={createNewDocument}
        onDocumentDelete={handleDeleteDocument}
        onDocumentRename={handleRenameDocument}
        onStartRename={startRenaming}  
        onIconChange={handleIconChange}
      />
      
      {activeDocumentId ? (
        <TailwindAdvancedEditor 
          key={activeDocumentId}
          document={documents.find(d => d.id === activeDocumentId)!}
          onUpdate={updateDocument}
        />
      ) : (
        <div className="ml-64 flex-1 p-6 flex items-center justify-center">
          <Button onClick={createNewDocument}>Create New Document</Button>
        </div>
      )}
    </div>
  );
}
