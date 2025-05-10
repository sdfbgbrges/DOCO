import React from 'react';
import { FileIcon, FolderIcon } from 'lucide-react';

interface FileNavHeaderProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}

const FileNavHeader: React.FC<FileNavHeaderProps> = ({ selectedGroup, onGroupChange }) => {
  const groups = ['Documents', 'Images', 'Downloads'];

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <FolderIcon className="w-5 h-5 text-gray-500" />
        <select
          value={selectedGroup}
          onChange={(e) => onGroupChange(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium"
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700">
          <FileIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FileNavHeader;