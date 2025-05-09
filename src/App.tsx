import React from 'react';
import { AppProvider } from './context/AppContext';
import MainHeader from './components/MainHeader';
import FileNavHeader from './components/FileNavHeader';
import FileManager from './components/FileManager';
import DocumentViewer from './components/DocumentViewer';
import { useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { 
    uiState, 
    activeDocument, 
    documents, 
    openedDocuments 
  } = useApp();
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Main Header (HEADER 1) */}
      <MainHeader />
      
      {/* Document Navigation Header (HEADER 2) */}
      <FileNavHeader />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Manager (collapsible) */}
        {uiState.showFileManager && (
          <div className="h-full transition-all duration-200">
            <FileManager />
          </div>
        )}
        
        {/* Document Viewing Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeDocument ? (
            <DocumentViewer documentId={activeDocument} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Welcome to DOCO</h2>
                <p className="text-gray-600 mb-6">
                  Your document viewing platform for reading on the go. Upload documents from the File Manager or click on an existing document to get started.
                </p>
                
                {openedDocuments.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-gray-500 mb-3">Recently opened documents:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {openedDocuments.slice(0, 5).map(docId => {
                        const doc = documents.find(d => d.id === docId);
                        if (!doc) return null;
                        
                        return (
                          <button 
                            key={doc.id}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                            onClick={() => useApp().setActiveDocument(doc.id)}
                          >
                            {doc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button 
                      className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                      onClick={() => useApp().setUIState(prev => ({ ...prev, showFileManager: true }))}
                    >
                      Open File Manager
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;