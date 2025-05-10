import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize2, Grid, Columns, Download, Save } from 'lucide-react';

interface DocumentToolbarProps {
  documentId: string;
  onToggleThumbnails: () => void;
}

const DocumentToolbar: React.FC<DocumentToolbarProps> = ({ documentId, onToggleThumbnails }) => {
  const { 
    documents, 
    updateDocumentPage, 
    updateDocumentZoom,
    updateDocumentRotation,
    setUIState,
    uiState,
    saveDocument,
    downloadDocument
  } = useApp();
  
  const document = documents.find(doc => doc.id === documentId);
  
  if (!document) return null;
  
  const handlePageChange = (offset: number) => {
    if (!document.totalPages) return;
    const newPage = document.currentPage + offset;
    if (newPage >= 1 && newPage <= document.totalPages) {
      updateDocumentPage(document.id, newPage);
    }
  };
  
  const handleZoom = (factor: number) => {
    const newZoom = Math.max(0.5, Math.min(3, document.zoom * factor));
    updateDocumentZoom(document.id, newZoom);
  };
  
  const handleRotate = () => {
    const newRotation = (document.rotation + 90) % 360;
    updateDocumentRotation(document.id, newRotation);
  };
  
  const handleViewModeToggle = () => {
    setUIState(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'single' ? 'double' : 'single'
    }));
  };
  
  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => handlePageChange(-1)}
        disabled={document.currentPage <= 1}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => handlePageChange(1)}
        disabled={!document.totalPages || document.currentPage >= document.totalPages}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      <div className="h-6 border-l border-gray-600 mx-2"></div>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => handleZoom(1.1)}
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => handleZoom(0.9)}
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={handleRotate}
      >
        <RotateCw className="w-5 h-5" />
      </button>
      
      <div className="h-6 border-l border-gray-600 mx-2"></div>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => setUIState(prev => ({ ...prev, fullscreen: !prev.fullscreen }))}
      >
        <Maximize2 className="w-5 h-5" />
      </button>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={onToggleThumbnails}
      >
        <Grid className="w-5 h-5" />
      </button>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={handleViewModeToggle}
      >
        <Columns className="w-5 h-5" />
      </button>
      
      <div className="flex-1"></div>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => downloadDocument(document.id)}
      >
        <Download className="w-5 h-5" />
      </button>
      
      <button
        className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
        onClick={() => saveDocument(document.id)}
        disabled={!document.dirty}
      >
        <Save className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DocumentToolbar;