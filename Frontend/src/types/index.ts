export enum UserPath {
  JEDI = 'Jedi Samurai',
  INFLUENCER = 'Influencer Exitoso',
  CAREER = 'Giro Profesional',
  HEALTH = 'Vida Saludable',
  ARTIST = 'Artista',
  PARENTING = 'Crianza Ejemplar',
}

export enum CoachMode {
  BIOPIC = 'Asistente de Biopic',
  ONTOLOGICAL = 'Coach Ontológico',
  BOSS = 'Tu Propio Jefe',
  GURU = 'Gurú Inspirador',
  COMPETITOR = 'Competidor Amistoso',
  ANTAGONIST = 'Antagonista Agresivo',
}

export type Platform = 'whatsapp' | 'telegram';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image_url?: string;
  tokens_used?: number;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  context_id: string;
  archetype_id: string;
  custom_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  agent_id: string;
  user_id: string;
  platform: Platform;
  started_at: string;
  ended_at? : string;
  is_pinned?: boolean;
  is_archived?: boolean;
  agent?: Agent;
}

export interface Context {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  icon?: string;
  color?: string;
  version?: number;
  is_active?: boolean;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  tone?: string;
  icon?: string;
  color?: string;
  version?: number;
  is_active?: boolean;
}

export interface SafetyPrompt {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
  version?: number;
}

export interface AppUser {
  id: string;
  display_name: string;
  email?: string;
  status: 'active' | 'inactive';
  created_at: string;
  role?: string;
}

export interface AdminUser {
  id: string;
  profile_id: string;
  role: 'super_admin' | 'admin' | 'assistant' | 'ai_agent';
  created_at: string;
  display_name?: string;
  email?: string;
}

export interface TokenStats {
  total_tokens: number;
  tokens_by_model?: Record<string, number>;
  tokens_by_user?: Record<string, number>;
}

export interface AnalyticsEvent {
  event_name: string;
  context_id?: string;
  archetype_id?: string;
  platform?: string;
  properties?: Record<string, any>;
}

export interface AgentNameProposal {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Any';
  context_id: string;
  archetype_id: string;
  contexts?: { name: string };
  archetypes?: { name: string };
  created_at: string;
}
