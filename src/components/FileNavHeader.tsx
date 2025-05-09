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
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  
  const activeGroup = groups.find(g => g.id === uiState.activeGroup);
  
  const handleGroupClick = (groupId: string) => {
    setUIState(prev => ({ ...prev, activeGroup: groupId }));
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
      setShowNewGroupInput(false);
    }
  };
  
  const handleAddNewGroup = () => {
    setShowNewGroupInput(true);
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
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
            uiState.showFileManager ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
          }`}
          onClick={handleFileManagerClick}
        >
          <FolderIcon className="h-4 w-4" />
          <span>Files Manager</span>
        </button>
        
        <div className="border-r border-gray-300 h-6" />
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">Groups:</span>
          
          <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
            {groups.map(group => (
              <button
                key={group.id}
                className={`px-3 py-1 rounded-md text-sm ${
                  uiState.activeGroup === group.id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleGroupClick(group.id)}
              >
                {group.name}
              </button>
            ))}
            
            {showNewGroupInput ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewGroup()}
                  placeholder="Group name"
                  className="px-2 py-1 rounded-md border border-gray-300 text-sm w-32"
                  autoFocus
                />
                <button
                  className="ml-1 text-primary-500 hover:text-primary-700"
                  onClick={handleNewGroup}
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                className="text-primary-500 hover:text-primary-700"
                onClick={handleAddNewGroup}
              >
                <PlusCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="border-r border-gray-300 h-6" />
        
        <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar">
          <Layers className="h-4 w-4 text-gray-500" />
          
          {groupDocuments.length === 0 ? (
            <span className="text-sm text-gray-500 italic">No open documents in this group</span>
          ) : (
            <>
              {groupDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={`flex items-center px-3 py-1 rounded-md text-sm cursor-pointer ${
                    doc.id === uiState.activeGroup
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
            
              <button className="text-primary-500 hover:text-primary-700">
                <PlusCircle className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        
        <div className="flex-grow"></div>
        
        <button className="text-gray-500 hover:text-gray-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default FileNavHeader;