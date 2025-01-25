import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaFolder, FaFile } from "react-icons/fa";

interface CollapsibleButtonProps {
  folderName: string; // Name of the folder
  files: string[]; // Array of file names
}

const CollapsibleButton: React.FC<CollapsibleButtonProps> = ({
  folderName,
  files,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className="flex items-center p-2 text-[#9b9b9b] hover:bg-[#383838] rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">
          {isOpen ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
        </span>
        <span className="mr-2">
          <FaFolder />
        </span>
        <span>{folderName}</span>
      </div>

      {isOpen && (
        <div className="pl-6 mt-1">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center p-2 hover:bg-[#383838] rounded cursor-pointer"
            >
              <span className="mr-2 text-[#9b9b9b]">
                <FaFile />
              </span>
              <span className="text-[#9b9b9b]">{file}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleButton;