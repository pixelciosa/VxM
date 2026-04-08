import axios from 'axios';
import { supabase } from './supabase';
import { Context, Archetype, Agent, ChatSession, Message, SafetyPrompt, AppUser, AdminUser, TokenStats, AgentNameProposal } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const libraryApi = {
  // Public
  getContexts: () => api.get<Context[]>('/library/contexts').then(res => res.data),
  getArchetypes: () => api.get<Archetype[]>('/library/archetypes').then(res => res.data),
  
  // Admin Contexts
  listAllContexts: () => api.get<Context[]>('/library/contexts/all').then(res => res.data),
  createContext: (data: Partial<Context>) => api.post<Context>('/library/contexts', data).then(res => res.data),
  updateContext: (id: string, data: Partial<Context>) => api.patch<Context>(`/library/contexts/${id}`, data).then(res => res.data),
  
  // Admin Archetypes
  listAllArchetypes: () => api.get<Archetype[]>('/library/archetypes/all').then(res => res.data),
  createArchetype: (data: Partial<Archetype>) => api.post<Archetype>('/library/archetypes', data).then(res => res.data),
  updateArchetype: (id: string, data: Partial<Archetype>) => api.patch<Archetype>(`/library/archetypes/${id}`, data).then(res => res.data),
  
  // Admin Safety Prompts
  listSafetyPrompts: () => api.get<SafetyPrompt[]>('/library/safety-prompts').then(res => res.data),
  createSafetyPrompt: (data: Partial<SafetyPrompt>) => api.post<SafetyPrompt>('/library/safety-prompts', data).then(res => res.data),
  updateSafetyPrompt: (id: string, data: Partial<SafetyPrompt>) => api.patch<SafetyPrompt>(`/library/safety-prompts/${id}`, data).then(res => res.data),
  
  // Admin Agent Name Proposals
  listNameProposals: () => api.get<AgentNameProposal[]>('/library/name-proposals').then(res => res.data),
  createNameProposal: (data: Partial<AgentNameProposal>) => api.post<AgentNameProposal>('/library/name-proposals', data).then(res => res.data),
  deleteNameProposal: (id: string) => api.delete(`/library/name-proposals/${id}`).then(res => res.data),
};

export const adminApi = {
  listAppUsers: () => api.get<AppUser[]>('/admin/users/app').then(res => res.data),
  listBackendUsers: () => api.get<AdminUser[]>('/admin/users/backend').then(res => res.data),
  updateAdminRole: (profileId: string, role: string) => api.patch<AdminUser>(`/admin/users/backend/${profileId}/role`, { role }).then(res => res.data),
  getTokenStats: () => api.get<TokenStats>('/admin/stats/tokens').then(res => res.data),
};

export const agentsApi = {
  createOrGetAgent: (contextId: string, archetypeId: string, platform: string, gender: string = 'Any') => 
    api.post<{ agent: Agent, session_id: string, greeting: string | null, is_new: boolean }>('/agents', {
      context_id: contextId,
      archetype_id: archetypeId,
      platform,
      gender
    }).then(res => res.data),
    
  sendMessage: (agentId: string, text: string, imageBase64?: string) =>
    api.post<{ reply: string, session_id: string, tokens_used: number }>(`/agents/${agentId}/messages`, {
      text,
      image_base64: imageBase64
    }).then(res => res.data),
    
  renameAgent: (agentId: string, name: string) =>
    api.patch(`/agents/${agentId}/name`, { name }).then(res => res.data),
};

export const sessionsApi = {
  listSessions: () => api.get<ChatSession[]>('/sessions').then(res => res.data),
  getMessages: (sessionId: string) => api.get<Message[]>(`/sessions/${sessionId}/messages`).then(res => res.data),
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => api.patch(`/sessions/${sessionId}`, updates).then(res => res.data),
  deleteSession: (id: string) => api.delete(`/sessions/${id}`).then(res => res.data),
};

export const profileApi = {
  getProfile: () => api.get('/profiles/me').then(res => res.data),
  updateProfile: (data: any) => api.put('/profiles/me', data).then(res => res.data),
};

export const analyticsApi = {
  trackEvent: (event: any) => api.post('/events', event).then(res => res.data),
};
