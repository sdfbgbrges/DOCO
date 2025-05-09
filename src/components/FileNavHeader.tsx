import React, { useState } from 'react';
import { FolderIcon, Layers, PlusCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FileNavHeader: React.FC = () => {
  const { 
    groups, 
    openedDocuments, 
    documents, 
    closeDocument, 
    setActiveDocument,
    uiState,
    setUIState,
    addGroup
  } = useApp();
  
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  
  const activeGroup = groups.find(g => g.id === uiState.activeGroup);
  
  const handleGroupClick = (groupId: string) => {
    setUIState(prev => ({ ...prev, activeGroup: groupId }));
    setShowGroupDropdown(false);
  };
  
  const handleDocumentClick = (docId: string) => {
    setActiveDocument(docId);
  };
  
  const handleCloseDocument = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    closeDocument(docId);
  };
  
  const handleNewGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName);
      setNewGroupName('');
      setShowGroupDropdown(false);
    }
  };
  
  const handleFileManagerClick = () => {
    setUIState(prev => ({ ...prev, showFileManager: !prev.showFileManager }));
  };

  // Filter documents by active group
  const groupDocuments = activeGroup 
    ? documents.filter(doc => activeGroup.documents.includes(doc.id) && openedDocuments.includes(doc.id))
    : [];
  
  return (
    <div className="bg-white border-b border-gray-200 h-12 flex items-center px-4 sticky top-14 z-10 overflow-x-auto">
      <div className="flex space-x-4 items-center">
        <button 
          className={`flex items-center p-1.5 rounded-md ${
            uiState.showFileManager ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
          }`}
          onClick={handleFileManagerClick}
        >
          <FolderIcon className="h-5 w-5" />
        </button>
        
        <div className="border-r border-gray-300 h-6" />
        
        <div className="relative">
          <button
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-md px-3 py-1.5"
            onClick={() => setShowGroupDropdown(!showGroupDropdown)}
          >
            <Layers className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium">{activeGroup?.name || 'Select Group'}</span>
          </button>
          
          {showGroupDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[200px] z-20">
              {groups.map(group => (
                <button
                  key={group.id}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    uiState.activeGroup === group.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleGroupClick(group.id)}
                >
                  {group.name}
                </button>
              ))}
              <div className="border-t border-gray-200 mt-1 pt-1">
                <div className="px-4 py-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewGroup()}
                    placeholder="New group name"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    className="mt-1 w-full px-2 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                    onClick={handleNewGroup}
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-r border-gray-300 h-6" />
        
        <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar">
          {groupDocuments.length === 0 ? (
            <span className="text-sm text-gray-500 italic">No open documents in this group</span>
          ) : (
            <>
              {groupDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={`flex items-center px-3 py-1 rounded-md text-sm cursor-pointer ${
                    doc.id === uiState.activeDocument
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <span className="truncate max-w-40">{doc.name}</span>
                  <button
                    className="ml-1.5 opacity-50 hover:opacity-100"
                    onClick={(e) => handleCloseDocument(e, doc.id)}
                  >
                    <span className="h-4 w-4 text-sm">×</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileNavHeader;