export type MessageType = 
  | 'code'
  | 'build'
  | 'git'
  | 'bug'
  | 'error'
  | 'llm_error'
  | 'dependency'
  | 'security'
  | 'test'
  | 'docs'
  | 'performance'
  | 'microagent_ready'
  | 'tetris_game'
  | 'user'
  | 'completed'
  | 'success'
  | 'fail';

export interface Message {
  role: 'user' | 'ai';
  text: string;
  type: MessageType;
  status: 'completed' | 'in_progress' | 'action_required' | 'success' | 'fail';
  headerText?: string;
  actions?: Array<{ label: string; action: string }>;
} 