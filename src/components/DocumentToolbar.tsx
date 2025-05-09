import React, { useState } from 'react';
import { 
  Menu, Highlighter, Pencil, Eraser, 
  Type, Minimize2, Maximize2, RotateCw, 
  Search, ToggleLeft, ToggleRight, MoreVertical, 
  Download, Maximize, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ColorPicker from './ColorPicker';

interface DocumentToolbarProps {
  documentId: string;
}

const DocumentToolbar: React.FC<DocumentToolbarProps> = ({ documentId }) => {
  const { 
    documents, toolState, setToolState, 
    uiState, setUIState, updateDocumentRotation,
    saveDocument
  } = useApp();
  
  const document = documents.find(doc => doc.id === documentId);
  const [showHighlighterOptions, setShowHighlighterOptions] = useState(false);
  const [showPencilOptions, setShowPencilOptions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!document) return null;
  
  const toggleTool = (tool: 'highlight' | 'pencil' | 'text' | 'eraser' | null) => {
    setToolState(prev => ({
      ...prev,
      activeTool: prev.activeTool === tool ? null : tool
    }));
  };
  
  const handleColorChange = (color: string) => {
    setToolState(prev => ({
      ...prev,
      color
    }));
  };
  
  const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToolState(prev => ({
      ...prev,
      thickness: parseInt(e.target.value)
    }));
  };
  
  const toggleTextOnlyHighlight = () => {
    setToolState(prev => ({
      ...prev,
      textOnly: !prev.textOnly
    }));
  };
  
  const toggleAutoSave = () => {
    setUIState(prev => ({
      ...prev,
      autoSave: !prev.autoSave
    }));
  };
  
  const handleRotate = () => {
    const newRotation = (document.rotation + 90) % 360;
    updateDocumentRotation(documentId, newRotation);
  };
  
  const toggleFullscreen = () => {
    setUIState(prev => ({
      ...prev,
      fullscreen: !prev.fullscreen
    }));
  };
  
  const toggleViewMode = () => {
    setUIState(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'single' ? 'double' : 'single'
    }));
  };
  
  const handleSave = () => {
    saveDocument(documentId);
  };
  
  return (
    <div className="bg-gray-800 text-white h-12 flex items-center justify-between px-4">
      {/* Left side tools */}
      <div className="flex items-center space-x-4">
        <button className="hover:bg-gray-700 p-1.5 rounded-md">
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <button 
            className={`hover:bg-gray-700 p-1.5 rounded-md ${
              toolState.activeTool === 'highlight' ? 'bg-gray-700' : ''
            }`}
            onClick={() => toggleTool('highlight')}
          >
            <Highlighter className="h-5 w-5" color={toolState.activeTool === 'highlight' ? toolState.color : undefined} />
          </button>
          
          <button 
            className="hover:bg-gray-700 p-1.5 rounded-md"
            onClick={() => setShowHighlighterOptions(!showHighlighterOptions)}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showHighlighterOptions && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 shadow-lg rounded-md p-4 w-64 z-20">
              <div className="mb-3">
                <div className="text-sm mb-2 text-gray-300">Colors</div>
                <ColorPicker
                  color={toolState.color}
                  onChange={handleColorChange}
                  colors={['#FACC15', '#84CC16', '#38BDF8', '#F472B6', '#EF4444']}
                />
              </div>
              
              <div className="mb-3">
                <div className="text-sm mb-2 text-gray-300">Thickness</div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">Thin</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={toolState.thickness} 
                    onChange={handleThicknessChange}
                    className="w-full h-2 accent-primary-500" 
                  />
                  <span className="text-xs text-gray-400 ml-2">Thick</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Text only highlight</span>
                <button 
                  className="text-white"
                  onClick={toggleTextOnlyHighlight}
                >
                  {toolState.textOnly ? (
                    <ToggleRight className="h-5 w-5 text-primary-400" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className={`hover:bg-gray-700 p-1.5 rounded-md ${
              toolState.activeTool === 'pencil' ? 'bg-gray-700' : ''
            }`}
            onClick={() => toggleTool('pencil')}
          >
            <Pencil className="h-5 w-5" color={toolState.activeTool === 'pencil' ? toolState.color : undefined} />
          </button>
          
          <button 
            className="hover:bg-gray-700 p-1.5 rounded-md"
            onClick={() => setShowPencilOptions(!showPencilOptions)}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showPencilOptions && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 shadow-lg rounded-md p-4 w-64 z-20">
              <div className="mb-3">
                <div className="text-sm mb-2 text-gray-300">Colors</div>
                <ColorPicker
                  color={toolState.color}
                  onChange={handleColorChange}
                  colors={[
                    '#000000', '#5E5E5E', '#7E7E7E', '#9E9E9E', '#BEBEBE', '#FFFFFF',
                    '#EC407A', '#EF4444', '#FF7F50', '#FFA726', '#FACC15', '#FFEB3B',
                    '#8BC34A', '#4CAF50', '#00695C', '#29B6F6', '#2196F3', '#673AB7',
                    '#9C27B0', '#E040FB', '#F5CBA7', '#BD967A', '#814E2B', '#503020'
                  ]}
                />
              </div>
              
              <div>
                <div className="text-sm mb-2 text-gray-300">Thickness</div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">Thin</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={toolState.thickness} 
                    onChange={handleThicknessChange}
                    className="w-full h-2 accent-primary-500" 
                  />
                  <span className="text-xs text-gray-400 ml-2">Thick</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button 
          className={`hover:bg-gray-700 p-1.5 rounded-md ${
            toolState.activeTool === 'eraser' ? 'bg-gray-700' : ''
          }`}
          onClick={() => toggleTool('eraser')}
        >
          <Eraser className="h-5 w-5" />
        </button>
        
        <button 
          className={`hover:bg-gray-700 p-1.5 rounded-md ${
            toolState.activeTool === 'text' ? 'bg-gray-700' : ''
          }`}
          onClick={() => toggleTool('text')}
        >
          <Type className="h-5 w-5" />
        </button>
      </div>
      
      {/* Center view controls */}
      <div className="flex items-center space-x-4">
        <button className="hover:bg-gray-700 p-1.5 rounded-md">
          <Minimize2 className="h-5 w-5" />
        </button>
        
        <button className="hover:bg-gray-700 p-1.5 rounded-md">
          <Maximize2 className="h-5 w-5" />
        </button>
        
        <span className="text-sm px-2">
          {document.currentPage} of {document.totalPages}
        </span>
        
        <button 
          className="hover:bg-gray-700 p-1.5 rounded-md"
          onClick={handleRotate}
        >
          <RotateCw className="h-5 w-5" />
        </button>
        
        <button 
          className={`hover:bg-gray-700 p-1.5 rounded-md ${
            uiState.viewMode === 'double' ? 'bg-gray-700' : ''
          }`}
          onClick={toggleViewMode}
        >
          <div className="flex items-center h-5 w-8 justify-between">
            <div className="h-5 w-2.5 border border-white rounded-sm"></div>
            <div className="h-5 w-2.5 border border-white rounded-sm"></div>
          </div>
        </button>
      </div>
      
      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            className={`hover:bg-gray-700 p-1.5 rounded-md ${showSearch ? 'bg-gray-700' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </button>
          
          {showSearch && (
            <div className="absolute top-full right-0 mt-1 bg-gray-800 shadow-lg rounded-md p-2 w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-primary-500"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Auto-save</span>
          <button onClick={toggleAutoSave}>
            {uiState.autoSave ? (
              <ToggleRight className="h-5 w-5 text-primary-400" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="hover:bg-gray-700 p-1.5 rounded-md"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showMoreOptions && (
            <div className="absolute top-full right-0 mt-1 bg-gray-800 shadow-lg rounded-md py-2 w-40 z-20">
              <button 
                className="flex items-center w-full px-4 py-2 hover:bg-gray-700 text-left"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-4 w-4 mr-2" />
                <span className="text-sm">Full Screen</span>
              </button>
              
              <button className="flex items-center w-full px-4 py-2 hover:bg-gray-700 text-left">
                <Download className="h-4 w-4 mr-2" />
                <span className="text-sm">Download</span>
              </button>
              
              {document.dirty && (
                <button 
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-700 text-left"
                  onClick={handleSave}
                >
                  <span className="text-sm">Save Changes</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentToolbar;