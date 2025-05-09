import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, File, Folder, Group, Document, Annotation, 
  ToolState, UIState 
} from '../types';

interface AppContextType {
  // User
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  
  // Files & Folders
  files: File[];
  folders: Folder[];
  addFile: (file: Omit<File, 'id' | 'createdAt' | 'updatedAt'>) => string;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => string;
  deleteFile: (id: string) => void;
  deleteFolder: (id: string) => void;
  moveFile: (id: string, newParentId: string | null) => void;
  moveFolder: (id: string, newParentId: string | null) => void;
  
  // Groups
  groups: Group[];
  addGroup: (name: string) => string;
  deleteGroup: (id: string) => void;
  addDocumentToGroup: (groupId: string, documentId: string) => void;
  removeDocumentFromGroup: (groupId: string, documentId: string) => void;
  
  // Documents
  documents: Document[];
  openedDocuments: string[];
  activeDocument: string | null;
  openDocument: (fileId: string) => string;
  closeDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void;
  updateDocumentPage: (id: string, page: number) => void;
  updateDocumentZoom: (id: string, zoom: number) => void;
  updateDocumentRotation: (id: string, rotation: number) => void;
  addAnnotation: (documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (documentId: string, annotationId: string) => void;
  saveDocument: (id: string) => void;
  
  // Tools
  toolState: ToolState;
  setToolState: React.Dispatch<React.SetStateAction<ToolState>>;
  
  // UI
  uiState: UIState;
  setUIState: React.Dispatch<React.SetStateAction<UIState>>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'doco-app-state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default state or load from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 'main',
      name: 'MAIN',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openedDocuments, setOpenedDocuments] = useState<string[]>([]);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  
  const [toolState, setToolState] = useState<ToolState>({
    activeTool: null,
    color: '#FACC15',
    thickness: 2
  });
  
  const [uiState, setUIState] = useState<UIState>({
    fullscreen: false,
    showFileManager: false,
    activeGroup: 'main',
    viewMode: 'single',
    autoSave: true
  });

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { 
          currentUser, files, folders, groups, documents,
          openedDocuments, activeDocument, toolState, uiState
        } = JSON.parse(savedState);
        
        if (currentUser) setCurrentUser(currentUser);
        if (files) setFiles(files.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt)
        })));
        if (folders) setFolders(folders.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt)
        })));
        if (groups) setGroups(groups.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt)
        })));
        if (documents) setDocuments(documents.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt)
        })));
        if (openedDocuments) setOpenedDocuments(openedDocuments);
        if (activeDocument) setActiveDocument(activeDocument);
        if (toolState) setToolState(toolState);
        if (uiState) setUIState(uiState);
      } catch (error) {
        console.error('Error loading state from localStorage', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      currentUser,
      files,
      folders,
      groups,
      documents,
      openedDocuments,
      activeDocument,
      toolState,
      uiState
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentUser, files, folders, groups, documents, openedDocuments, activeDocument, toolState, uiState]);

  // User functions
  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // File & Folder functions
  const addFile = (fileData: Omit<File, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uuidv4();
    const newFile: File = {
      ...fileData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setFiles(prev => [...prev, newFile]);
    return id;
  };

  const addFolder = (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uuidv4();
    const newFolder: Folder = {
      ...folderData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setFolders(prev => [...prev, newFolder]);
    return id;
  };

  const deleteFile = (id: string) => {
    // Close any open documents related to this file
    const relatedDocuments = documents.filter(doc => doc.fileId === id);
    relatedDocuments.forEach(doc => {
      closeDocument(doc.id);
    });
    
    // Delete the file
    setFiles(prev => prev.filter(file => file.id !== id));
    
    // Remove from documents array
    setDocuments(prev => prev.filter(doc => doc.fileId !== id));
  };

  const deleteFolder = (id: string) => {
    // Delete all files in the folder
    const filesInFolder = files.filter(file => file.parentId === id);
    filesInFolder.forEach(file => {
      deleteFile(file.id);
    });
    
    // Delete all subfolders recursively
    const subFolders = folders.filter(folder => folder.parentId === id);
    subFolders.forEach(folder => {
      deleteFolder(folder.id);
    });
    
    // Delete the folder itself
    setFolders(prev => prev.filter(folder => folder.id !== id));
  };

  const moveFile = (id: string, newParentId: string | null) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, parentId: newParentId, updatedAt: new Date() } 
        : file
    ));
  };

  const moveFolder = (id: string, newParentId: string | null) => {
    // Prevent circular references
    if (id === newParentId) return;
    
    // Check if newParentId is a descendant of id
    let parent = folders.find(f => f.id === newParentId);
    while (parent) {
      if (parent.id === id) return; // Circular reference detected
      parent = folders.find(f => f.id === parent?.parentId);
    }
    
    setFolders(prev => prev.map(folder => 
      folder.id === id 
        ? { ...folder, parentId: newParentId, updatedAt: new Date() } 
        : folder
    ));
  };

  // Group functions
  const addGroup = (name: string) => {
    const id = uuidv4();
    const newGroup: Group = {
      id,
      name,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setGroups(prev => [...prev, newGroup]);
    return id;
  };

  const deleteGroup = (id: string) => {
    // Don't delete the main group
    if (id === 'main') return;
    
    // Remove the group
    setGroups(prev => prev.filter(group => group.id !== id));
    
    // Set active group to main if the deleted group was active
    if (uiState.activeGroup === id) {
      setUIState(prev => ({ ...prev, activeGroup: 'main' }));
    }
  };

  const addDocumentToGroup = (groupId: string, documentId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId && !group.documents.includes(documentId)
        ? { 
            ...group, 
            documents: [...group.documents, documentId],
            updatedAt: new Date() 
          } 
        : group
    ));
  };

  const removeDocumentFromGroup = (groupId: string, documentId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId
        ? { 
            ...group, 
            documents: group.documents.filter(id => id !== documentId),
            updatedAt: new Date() 
          } 
        : group
    ));
  };

  // Document functions
  const openDocument = (fileId: string) => {
    // Check if a document for this file already exists
    const existingDoc = documents.find(doc => doc.fileId === fileId);
    
    if (existingDoc) {
      // If not already open, add to opened documents
      if (!openedDocuments.includes(existingDoc.id)) {
        setOpenedDocuments(prev => [...prev, existingDoc.id]);
      }
      setActiveDocument(existingDoc.id);
      return existingDoc.id;
    }
    
    // Create a new document
    const file = files.find(f => f.id === fileId);
    if (!file) throw new Error('File not found');
    
    const id = uuidv4();
    const newDocument: Document = {
      id,
      name: file.name,
      fileId,
      annotations: [],
      currentPage: 1,
      totalPages: 1, // Will be updated once PDF is loaded
      zoom: 1,
      rotation: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      dirty: false
    };
    
    setDocuments(prev => [...prev, newDocument]);
    setOpenedDocuments(prev => [...prev, id]);
    setActiveDocument(id);
    
    // Add to current active group
    addDocumentToGroup(uiState.activeGroup, id);
    
    return id;
  };

  const closeDocument = (id: string) => {
    // Save document before closing if auto-save is enabled
    const doc = documents.find(d => d.id === id);
    if (doc && doc.dirty && uiState.autoSave) {
      saveDocument(id);
    }
    
    // Remove from openedDocuments
    setOpenedDocuments(prev => prev.filter(docId => docId !== id));
    
    // If this was the active document, set active to null or another open document
    if (activeDocument === id) {
      const nextDoc = openedDocuments.find(docId => docId !== id);
      setActiveDocument(nextDoc || null);
    }
  };

  const updateDocumentPage = (id: string, page: number) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, currentPage: page, updatedAt: new Date() } 
        : doc
    ));
  };

  const updateDocumentZoom = (id: string, zoom: number) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, zoom, updatedAt: new Date() } 
        : doc
    ));
  };

  const updateDocumentRotation = (id: string, rotation: number) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, rotation, updatedAt: new Date() } 
        : doc
    ));
  };

  const addAnnotation = (documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    const id = uuidv4();
    const newAnnotation: Annotation = {
      ...annotation,
      id,
      createdAt: new Date()
    };
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            annotations: [...doc.annotations, newAnnotation],
            updatedAt: new Date(),
            dirty: true
          } 
        : doc
    ));
  };

  const removeAnnotation = (documentId: string, annotationId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            annotations: doc.annotations.filter(a => a.id !== annotationId),
            updatedAt: new Date(),
            dirty: true
          } 
        : doc
    ));
  };

  const saveDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, dirty: false, updatedAt: new Date() } 
        : doc
    ));
    // In a real app, we would save to a server here
    console.log(`Document ${id} saved`);
  };

  const value = {
    // User
    currentUser,
    login,
    logout,
    
    // Files & Folders
    files,
    folders,
    addFile,
    addFolder,
    deleteFile,
    deleteFolder,
    moveFile,
    moveFolder,
    
    // Groups
    groups,
    addGroup,
    deleteGroup,
    addDocumentToGroup,
    removeDocumentFromGroup,
    
    // Documents
    documents,
    openedDocuments,
    activeDocument,
    openDocument,
    closeDocument,
    setActiveDocument,
    updateDocumentPage,
    updateDocumentZoom,
    updateDocumentRotation,
    addAnnotation,
    removeAnnotation,
    saveDocument,
    
    // Tools
    toolState,
    setToolState,
    
    // UI
    uiState,
    setUIState
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};