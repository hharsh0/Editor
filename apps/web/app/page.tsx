"use client";

import FileManager from "@/components/file-system/file-manager";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import { defaultEditorContent } from "@/lib/content";
import { useEffect, useState } from "react";
import type { Document } from "@/types";

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
      title: "Untitled",
      name: `Untitled${documents.length + 1}`,
      // content: { type: "doc", content: [] },
      content: { defaultEditorContent },
      htmlContent: "",
      markdown: "",
      saveStatus: "Unsaved",
      wordsCount: 0,
      icon: "",
    };

    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
    );
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => {
      const newDocs = prev.filter((doc) => doc.id !== id);
      // If we deleted the active document, clear the active ID
      if (activeDocumentId === id) {
        setActiveDocumentId(newDocs.length > 0 ? newDocs[0].id : null);
      }
      return newDocs;
    });
  };

  const handleRenameDocument = (id: string, newName: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, name: newName, isRenaming: false } : doc,
      ),
    );
  };

  const startRenaming = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, isRenaming: true }
          : { ...doc, isRenaming: false },
      ),
    );
  };

  const handleIconChange = (id: string, icon: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, icon } : doc)),
    );
  };

  const activeDocument = documents.find((doc) => doc?.id === activeDocumentId);

  return (
    <>
      <title>{activeDocument?.title}</title>
      <div className="flex min-h-screen">
        {/* {!isMobile && ( */}
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
        {/* )} */}

        {activeDocumentId ? (
          <TailwindAdvancedEditor
            key={activeDocumentId}
            document={documents.find((d) => d.id === activeDocumentId)!}
            onUpdate={updateDocument}
          />
        ) : (
          <div className="md:ml-64 flex-1 p-6 flex items-center justify-center">
            <Button onClick={createNewDocument}>Create New Document</Button>
          </div>
        )}
      </div>
    </>
  );
}
