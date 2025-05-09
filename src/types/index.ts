export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: ArrayBuffer;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  fileId: string;
  annotations: Annotation[];
  currentPage: number;
  totalPages: number;
  zoom: number;
  rotation: number;
  createdAt: Date;
  updatedAt: Date;
  dirty: boolean;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'pencil' | 'text' | 'eraser';
  color: string;
  thickness: number;
  points?: { x: number; y: number }[];
  text?: string;
  position?: { x: number; y: number };
  page: number;
  createdAt: Date;
}

export interface ToolState {
  activeTool: 'highlight' | 'pencil' | 'text' | 'eraser' | null;
  color: string;
  thickness: number;
  textOnly?: boolean;
}

export interface UIState {
  fullscreen: boolean;
  showFileManager: boolean;
  activeGroup: string;
  viewMode: 'single' | 'double';
  autoSave: boolean;
}