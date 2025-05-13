
export interface Microtask {
  id: string;
  name: string;
  estimatedTime: number; // in hours
  isCompleted: boolean;
  
}

export interface Phase {
  id:string;
  name: string;
  microtasks: Microtask[];
}

export interface Project {
  title: string;
  description: string;
  phases: Phase[];
  team: string[];
  lastModified: number | object | null; // For Firebase serverTimestamp, then number
}

export interface UserProject {
  id: string;
  name: string;
  lastModified?: number | object | null;
}
