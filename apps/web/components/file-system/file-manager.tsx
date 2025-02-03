"use client";

import React, { useState } from "react";
import { Button } from "../tailwind/ui/button";
import { FiEdit, FiTrash2, FiPlus, FiImage, FiSmile } from "react-icons/fi";
import { File, FileText } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import type { Document } from "@/types";

interface FileManagerProps {
  documents: Document[];
  activeDocumentId: string | null;
  onDocumentSelect: (id: string) => void;
  onCreateNew: () => void;
  onDocumentDelete: (id: string) => void;
  onDocumentRename: (id: string, name: string) => void;
  onStartRename: (id: string) => void;
  onIconChange: (id: string, icon: string) => void;
}

function FileManager({ 
  documents, 
  activeDocumentId, 
  onDocumentSelect, 
  onCreateNew,
  onDocumentDelete,
  onDocumentRename,
  onStartRename,
  onIconChange,
}: FileManagerProps) {
  const [showPickerForDoc, setShowPickerForDoc] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleRename = (id: string, newName: string) => {
    if (newName.trim()) {
      onDocumentRename(id, newName.trim());
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (showPickerForDoc) {
      onIconChange(showPickerForDoc, emoji);
      setShowPickerForDoc(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onIconChange(docId, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setFileInputKey(Date.now()); // Reset file input
  };

  return (
    <div>
      <div className="fixed top-0 left-0 h-screen w-64 bg-[#202020] text-white p-4 thin-border-right">
        {/* Emoji Picker */}
        {showPickerForDoc && (
          <div className="absolute left-64 top-0 z-50">
            <EmojiPicker
              onEmojiClick={(e) => handleEmojiSelect(e.emoji)}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="text-lg text-[#9b9b9b] font-bold">Documents</div>
          <Button 
            onClick={onCreateNew}
            variant="ghost"
            className="text-[#9b9b9b] hover:bg-[#383838] flex items-center gap-1"
          >
            <FiPlus className="text-sm" />
            New
          </Button>
        </div>

        <div className="mb-6">
          <div className="text-sm font-semibold text-[#9b9b9b] mb-2 px-2 py-2">
            Your Documents
          </div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center hover:bg-[#2c2c2c] text-sm px-2 py-2 rounded-lg cursor-pointer my-1 ${
                activeDocumentId === doc.id 
                  ? "bg-[#2c2c2c] text-white" 
                  : "hover:bg-[#383838] text-[#9b9b9b]"
              }`}
            >
              {/* Icon Container */}
              <div className="relative group/icon mr-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  {doc.icon ? (
                    doc.icon.startsWith("data:image") ? (
                      <img 
                        src={doc.icon} 
                        alt="Document icon" 
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <span className="text-lg">{doc.icon}</span>
                    )
                  ) : (
                    //default icon
                    // <span className="text-lg">📄</span>
                    <span><FileText className="w-4 h-4" /></span>
                  )}
                </div>
                
                {/* Icon Change Buttons */}
                {/* <div className="absolute -right-2 -top-2 opacity-0 group-hover/icon:opacity-100 flex gap-1">
                  <button
                    onClick={() => setShowPickerForDoc(doc.id)}
                    className="p-1 rounded-full bg-[#505050] hover:bg-[#606060]"
                  >
                    <FiSmile className="w-3 h-3" />
                  </button>
                  <label className="p-1 rounded-full bg-[#505050] hover:bg-[#606060] cursor-pointer">
                    <FiImage className="w-3 h-3" />
                    <input
                      key={fileInputKey}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, doc.id)}
                    />
                  </label>
                </div> */}
              </div>

              {/* Document Name */}
              <div className="flex-1 flex items-center justify-between">
                {doc.isRenaming ? (
                  <input
                    type="text"
                    defaultValue={doc.name}
                    autoFocus
                    className="bg-transparent outline-none w-full"
                    onBlur={(e) => handleRename(doc.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(doc.id, e.currentTarget.value);
                      }
                    }}
                  />
                ) : (
                  <div 
                    className="flex-1"
                    onClick={() => onDocumentSelect(doc.id)}
                    onDoubleClick={()=>onStartRename(doc.id)}
                  >
                    {doc.name} {doc.saveStatus === "Unsaved" && "*"}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2">
                  <button
                    onClick={() => onStartRename(doc.id)}
                    className="hover:bg-[#505050] p-1 rounded"
                    aria-label="Rename document"
                  >
                    <FiEdit className="text-sm text-white" />
                  </button>
                  <button
                    onClick={() => onDocumentDelete(doc.id)}
                    className="hover:bg-[#505050] p-1 rounded ml-1"
                    aria-label="Delete document"
                  >
                    <FiTrash2 className="text-sm text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FileManager;