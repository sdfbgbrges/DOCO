import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import DocumentToolbar from './DocumentToolbar';
import { useApp } from '../context/AppContext';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentId: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId }) => {
  const { 
    documents, 
    files, 
    updateDocumentPage, 
    updateDocumentZoom,
    uiState,
    toolState,
    addAnnotation,
    removeAnnotation,
    saveDocument
  } = useApp();
  
  const document = documents.find(doc => doc.id === documentId);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);
  const [thumbnailsCache, setThumbnailsCache] = useState<Map<number, string>>(new Map());
  const [visibleThumbnailRange, setVisibleThumbnailRange] = useState({ start: 1, end: 10 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Get the file for this document
  const file = document ? files.find(f => f.id === document.fileId) : null;
  
  // Convert ArrayBuffer to Blob URL for PDF.js
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (file?.content) {
      const blob = new Blob([file.content], { type: file.type });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Handle zoom with touchpad/wheel
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.min(Math.max(0.5, prev * delta), 3));
    }
  };

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    if (document) {
      setNumPages(numPages);
      const updatedDoc = { ...document, totalPages: numPages };
      documents.splice(documents.indexOf(document), 1, updatedDoc);
    }
  };

  // Load thumbnails progressively
  const loadThumbnailRange = useCallback(async (start: number, end: number) => {
    if (!pdfUrl || !numPages) return;
    
    for (let i = start; i <= Math.min(end, numPages); i++) {
      if (!thumbnailsCache.has(i)) {
        const canvas = document.createElement('canvas');
        const page = await pdfjs.getDocument(pdfUrl).promise.then(pdf => pdf.getPage(i));
        const viewport = page.getViewport({ scale: 0.2 });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport
        }).promise;
        
        setThumbnailsCache(prev => new Map(prev).set(i, canvas.toDataURL()));
      }
    }
  }, [pdfUrl, numPages, thumbnailsCache]);

  // Handle thumbnail scroll
  const handleThumbnailScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = 150; // Approximate height of each thumbnail
    
    const start = Math.floor(scrollTop / itemHeight);
    const visibleItems = Math.ceil(container.clientHeight / itemHeight);
    const end = start + visibleItems + 5; // Load 5 more for smooth scrolling
    
    setVisibleThumbnailRange({ start: start + 1, end });
    loadThumbnailRange(start + 1, end);
  }, [loadThumbnailRange]);

  // Handle page navigation with touch/click
  const handlePageAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!document || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedOnLeftSide = x < rect.width / 3;
    const clickedOnRightSide = x > (rect.width * 2) / 3;
    
    if (clickedOnLeftSide) {
      changePage(-1);
    } else if (clickedOnRightSide) {
      changePage(1);
    }
  };

  // Handle touch start for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // Handle touch end for swipe navigation
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    if (Math.abs(deltaX) > 50) { // Minimum swipe distance
      if (deltaX > 0) {
        changePage(-1);
      } else {
        changePage(1);
      }
    }
    
    setTouchStartX(null);
  };

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (document?.dirty && !uiState.autoSave) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [document?.dirty, uiState.autoSave]);

  // Auto-save handling
  useEffect(() => {
    if (document?.dirty && uiState.autoSave) {
      const timeoutId = setTimeout(() => {
        saveDocument(document.id);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [document?.dirty, uiState.autoSave]);

  // Adjust canvas size on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setPageWidth(canvasRef.current.offsetWidth);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [canvasRef, uiState.fullscreen]);
  
  // Handle page changes
  const changePage = useCallback((offset: number) => {
    if (!document || !numPages) return;
    
    const newPage = document.currentPage + offset;
    if (newPage >= 1 && newPage <= numPages) {
      updateDocumentPage(document.id, newPage);
    }
  }, [document, numPages, updateDocumentPage]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        changePage(-1);
      } else if (e.key === 'ArrowRight') {
        changePage(1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changePage]);
  
  // Handle zoom changes
  const changeZoom = (factor: number) => {
    if (!document) return;
    
    // Limit zoom between 0.5 and 3
    const newZoom = Math.max(0.5, Math.min(3, document.zoom * factor));
    updateDocumentZoom(document.id, newZoom);
  };
  
  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!document || toolState.activeTool !== 'pencil' && toolState.activeTool !== 'highlight') return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / document.zoom;
    const y = (e.clientY - rect.top) / document.zoom;
    
    const strokeId = Math.random().toString(36).substring(7);
    setCurrentStrokeId(strokeId);
    setCurrentPoints([{ x, y }]);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !document) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / document.zoom;
    const y = (e.clientY - rect.top) / document.zoom;
    
    setCurrentPoints(prevPoints => [...prevPoints, { x, y }]);
  };
  
  const endDrawing = () => {
    if (isDrawing && document && currentPoints.length > 1) {
      // Save the drawing as an annotation
      addAnnotation(document.id, {
        id: currentStrokeId!,
        type: toolState.activeTool === 'pencil' ? 'pencil' : 'highlight',
        color: toolState.color,
        thickness: toolState.thickness,
        points: currentPoints,
        page: document.currentPage
      });
    }
    
    setIsDrawing(false);
    setCurrentPoints([]);
    setCurrentStrokeId(null);
  };
  
  // Handle eraser
  const handleErase = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!document || toolState.activeTool !== 'eraser') return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / document.zoom;
    const y = (e.clientY - rect.top) / document.zoom;
    
    // Find the annotation to erase
    const annotation = document.annotations
      .find(a => a.page === document.currentPage && a.points?.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 10;
      }));
    
    if (annotation) {
      removeAnnotation(document.id, annotation.id);
    }
  };
  
  // Handle text annotation
  const handleTextAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!document || toolState.activeTool !== 'text') return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / document.zoom;
    const y = (e.clientY - rect.top) / document.zoom;
    
    const text = prompt('Enter text:');
    if (text) {
      const annotationId = Math.random().toString(36).substring(7);
      addAnnotation(document.id, {
        id: annotationId,
        type: 'text',
        color: toolState.color,
        thickness: toolState.thickness,
        text,
        position: { x, y },
        page: document.currentPage
      });
    }
  };
  
  if (!document) {
    return <div className="flex-1 flex items-center justify-center">Document not found</div>;
  }
  
  // Calculate rotation transform origin
  const rotationStyle = {
    transform: `scale(${document.zoom}) rotate(${document.rotation}deg)`,
    transformOrigin: 'center center',
    transition: 'transform 0.2s ease'
  };
  
  return (
    <div className={uiState.fullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'flex-1 relative overflow-hidden'}>
      <DocumentToolbar 
        documentId={documentId} 
        onToggleThumbnails={() => setShowThumbnails(!showThumbnails)} 
      />
      
      <div className="flex h-[calc(100%-3rem)]">
        {showThumbnails && (
          <div 
            className="bg-gray-900 w-64 flex-none overflow-y-auto"
            onScroll={handleThumbnailScroll}
          >
            <div className="p-2">
              {Array.from({ length: numPages || 0 }).map((_, index) => {
                const pageNum = index + 1;
                if (pageNum < visibleThumbnailRange.start || pageNum > visibleThumbnailRange.end) {
                  return <div key={index} className="h-[150px] bg-gray-800 mb-2 rounded" />;
                }
                
                return (
                  <div
                    key={index}
                    className={`mb-2 cursor-pointer rounded overflow-hidden ${
                      document.currentPage === pageNum ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => updateDocumentPage(document.id, pageNum)}
                  >
                    {thumbnailsCache.has(pageNum) ? (
                      <img 
                        src={thumbnailsCache.get(pageNum)} 
                        alt={`Page ${pageNum}`}
                        className="w-full"
                      />
                    ) : (
                      <div className="h-[150px] bg-gray-800 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className="flex-1 h-full overflow-auto flex justify-center bg-gray-800 p-4"
          onClick={handlePageAreaClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            userSelect: toolState.activeTool ? 'none' : 'auto',
            cursor: toolState.activeTool ? 'crosshair' : 'auto'
          }}
        >
          <div 
            ref={canvasRef}
            className="flex-1 h-full overflow-auto flex justify-center bg-gray-800 p-4"
            onMouseDown={startDrawing}
            onMouseMove={(e) => {
              if (isDrawing) {
                draw(e);
              } else if (toolState.activeTool === 'eraser') {
                handleErase(e);
              }
            }}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onClick={handleTextAnnotation}
          >
            {pdfUrl ? (
              <div style={rotationStyle}>
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  }
                  error={
                    <div className="text-center p-8">
                      <p className="text-red-500 font-semibold mb-2">Error loading document</p>
                      <p className="text-gray-200">Unable to load the PDF file.</p>
                    </div>
                  }
                >
                  {uiState.viewMode === 'single' ? (
                    <Page
                      pageNumber={document.currentPage}
                      width={pageWidth * 0.8}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="shadow-lg rounded mb-4"
                    />
                  ) : (
                    <div className="flex gap-4">
                      <Page
                        pageNumber={document.currentPage}
                        width={pageWidth * 0.4}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg rounded mb-4"
                      />
                      {numPages && document.currentPage < numPages && (
                        <Page
                          pageNumber={document.currentPage + 1}
                          width={pageWidth * 0.4}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="shadow-lg rounded mb-4"
                        />
                      )}
                    </div>
                  )}
                </Document>
                
                <svg 
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  {isDrawing && currentPoints.length > 1 && (
                    <path
                      d={`M ${currentPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                      stroke={toolState.color}
                      strokeWidth={toolState.thickness}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={toolState.activeTool === 'highlight' ? 0.5 : 1}
                    />
                  )}
                  
                  {document.annotations
                    .filter(a => a.page === document.currentPage)
                    .map((annotation) => {
                      if (annotation.type === 'pencil' && annotation.points) {
                        return (
                          <path
                            key={annotation.id}
                            d={`M ${annotation.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            stroke={annotation.color}
                            strokeWidth={annotation.thickness}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      } else if (annotation.type === 'highlight' && annotation.points) {
                        return (
                          <path
                            key={annotation.id}
                            d={`M ${annotation.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            stroke={annotation.color}
                            strokeWidth={annotation.thickness}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={0.5}
                          />
                        );
                      } else if (annotation.type === 'text' && annotation.position) {
                        return (
                          <foreignObject
                            key={annotation.id}
                            x={annotation.position.x}
                            y={annotation.position.y}
                            width="200"
                            height="auto"
                          >
                            <div
                              style={{
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                padding: '4px',
                                fontSize: '14px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              {annotation.text}
                            </div>
                          </foreignObject>
                        );
                      }
                      return null;
                    })}
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-lg">No document loaded</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {pdfUrl && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-800 bg-opacity-70 rounded-full p-1 text-white">
          <button
            className="p-2 hover:bg-gray-700 rounded-full"
            onClick={() => changePage(-1)}
            disabled={document.currentPage <= 1}
          >
            &lt;
          </button>
          <span className="mx-4">
            {document.currentPage} / {numPages || '?'}
          </span>
          <button
            className="p-2 hover:bg-gray-700 rounded-full"
            onClick={() => changePage(1)}
            disabled={!numPages || document.currentPage >= numPages}
          >
            &gt;
          </button>
          <div className="mx-2 h-6 border-l border-gray-600"></div>
          <button
            className="p-2 hover:bg-gray-700 rounded-full"
            onClick={() => changeZoom(1.1)}
          >
            +
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-full"
            onClick={() => changeZoom(0.9)}
          >
            -
          </button>
        </div>
      )}
      
      {uiState.fullscreen && (
        <button 
          className="absolute top-3 right-3 bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
          onClick={() => useApp().setUIState(prev => ({ ...prev, fullscreen: false }))}
        >
          <span className="text-lg">×</span>
        </button>
      )}
    </div>
  );
};

export default DocumentViewer;