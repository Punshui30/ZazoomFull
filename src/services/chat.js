import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

class ChatService {
  async saveMessage(userId, message) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message,
          type: 'user'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to save chat message:', error);
      throw error;
    }
  }

  async getMessages(userId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get chat messages:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();