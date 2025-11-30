export interface Cue {
  id?: number;
  pose_id?: number;
  content: string;
  type: 'entry' | 'action' | 'safety';
  sequence: number;
  created_at?: string;
}

export interface Pose {
  id: number;
  name_zh: string;
  name_en: string;
  image_url?: string;
  category: string;
  created_at?: string;
  cues?: Cue[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: 'editor' | 'admin' | 'user';
}

export interface DrawingFunction {
  (ctx: CanvasRenderingContext2D): void;
}

export interface StickFigureMap {
  [key: string]: DrawingFunction;
}