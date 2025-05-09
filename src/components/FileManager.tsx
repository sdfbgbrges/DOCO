import React, { useState } from 'react';
import { FolderIcon, FolderPlus, FileUp, File, Trash2, Copy, Scissors, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FileManager: React.FC = () => {
  const { 
    folders, 
    files, 
    addFolder, 
    addFile, 
    deleteFile, 
    deleteFolder, 
    moveFile, 
    moveFolder,
    openDocument
  } = useApp();
  
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ id: string; type: 'file' | 'folder' }[]>([]);
  const [clipboardItems, setClipboardItems] = useState<{ id: string; type: 'file' | 'folder'; action: 'copy' | 'cut' }[]>([]);
  
  // Get current folder's path
  const getFolderPath = (folderId: string | null, path: string[] = []): string[] => {
    if (!folderId) return path;
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return path;
    
    return getFolderPath(folder.parentId, [folder.name, ...path]);
  };
  
  const folderPath = getFolderPath(currentFolder);
  
  // Get current folder's contents
  const folderContents = {
    folders: folders.filter(folder => folder.parentId === currentFolder),
    files: files.filter(file => file.parentId === currentFolder)
  };
  
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder({
        name: newFolderName,
        parentId: currentFolder
      });
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };
  
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          addFile({
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result as ArrayBuffer,
            parentId: currentFolder
          });
        };
        reader.readAsArrayBuffer(file);
      });
    }
  };
  
  const handleItemClick = (id: string, type: 'file' | 'folder') => {
    if (type === 'folder') {
      setCurrentFolder(id);
      setSelectedItems([]);
    } else {
      // Open document
      openDocument(id);
    }
  };
  
  const handleItemSelect = (e: React.MouseEvent, id: string, type: 'file' | 'folder') => {
    e.stopPropagation();
    
    const isSelected = selectedItems.some(item => item.id === id && item.type === type);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(item => !(item.id === id && item.type === type)));
    } else {
      setSelectedItems([...selectedItems, { id, type }]);
    }
  };
  
  const handleDelete = () => {
    selectedItems.forEach(item => {
      if (item.type === 'file') {
        deleteFile(item.id);
      } else {
        deleteFolder(item.id);
      }
    });
    setSelectedItems([]);
  };
  
  const handleCopy = () => {
    setClipboardItems(selectedItems.map(item => ({ ...item, action: 'copy' })));
  };
  
  const handleCut = () => {
    setClipboardItems(selectedItems.map(item => ({ ...item, action: 'cut' })));
  };
  
  const handlePaste = () => {
    clipboardItems.forEach(item => {
      if (item.type === 'file') {
        moveFile(item.id, currentFolder);
      } else {
        moveFolder(item.id, currentFolder);
      }
      
      // If it was a cut operation, clear after paste
      if (item.action === 'cut') {
        setClipboardItems([]);
        setSelectedItems([]);
      }
    });
  };
  
  return (
    <div className="h-full bg-white border-r border-gray-200 w-72 flex flex-col overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
        <h2 className="font-semibold text-sm">Files Manager</h2>
        
        <div className="flex space-x-1">
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={() => setShowNewFolderInput(true)}
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4 text-gray-600" />
          </button>
          
          <label className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Upload File">
            <FileUp className="h-4 w-4 text-gray-600" />
            <input type="file" className="hidden" onChange={handleUploadFile} multiple />
          </label>
          
          {selectedItems.length > 0 && (
            <>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={handleCopy}
                title="Copy"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
              
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={handleCut}
                title="Cut"
              >
                <Scissors className="h-4 w-4 text-gray-600" />
              </button>
              
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-gray-600" />
              </button>
            </>
          )}
          
          {clipboardItems.length > 0 && (
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={handlePaste}
              title="Paste"
            >
              <span className="text-xs font-medium text-gray-600">Paste</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center text-xs">
        <button
          className="hover:bg-gray-200 px-1.5 py-0.5 rounded mr-1"
          onClick={() => setCurrentFolder(null)}
        >
          Root
        </button>
        
        {folderPath.map((folder, index) => (
          <React.Fragment key={index}>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-600">{folder}</span>
          </React.Fragment>
        ))}
      </div>
      
      {showNewFolderInput && (
        <div className="p-2 border-b border-gray-200">
          <div className="flex">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <button
              className="px-2 py-1 bg-primary-500 text-white rounded-r text-sm"
              onClick={handleCreateFolder}
            >
              Create
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {folderContents.folders.length === 0 && folderContents.files.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>This folder is empty</p>
            <p className="text-xs mt-1">Upload files or create a new folder</p>
          </div>
        )}
        
        {folderContents.folders.map(folder => {
          const isSelected = selectedItems.some(item => item.id === folder.id && item.type === 'folder');
          
          return (
            <div
              key={folder.id}
              className={`flex items-center p-1.5 rounded cursor-pointer ${
                isSelected ? 'bg-primary-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleItemClick(folder.id, 'folder')}
            >
              <div 
                className="h-4 w-4 mr-2 flex items-center justify-center rounded"
                onClick={(e) => handleItemSelect(e, folder.id, 'folder')}
              >
                {isSelected ? (
                  <div className="h-3 w-3 bg-primary-500 rounded-sm" />
                ) : (
                  <div className="h-3 w-3 border border-gray-400 rounded-sm" />
                )}
              </div>
              
              <FolderIcon className="h-5 w-5 text-accent-500 mr-2" />
              <span className="text-sm">{folder.name}</span>
            </div>
          );
        })}
        
        {folderContents.files.map(file => {
          const isSelected = selectedItems.some(item => item.id === file.id && item.type === 'file');
          
          return (
            <div
              key={file.id}
              className={`flex items-center p-1.5 rounded cursor-pointer ${
                isSelected ? 'bg-primary-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleItemClick(file.id, 'file')}
            >
              <div 
                className="h-4 w-4 mr-2 flex items-center justify-center rounded"
                onClick={(e) => handleItemSelect(e, file.id, 'file')}
              >
                {isSelected ? (
                  <div className="h-3 w-3 bg-primary-500 rounded-sm" />
                ) : (
                  <div className="h-3 w-3 border border-gray-400 rounded-sm" />
                )}
              </div>
              
              <File className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm">{file.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileManager;