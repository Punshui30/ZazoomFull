import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

class ReferralService {
  async createReferral(userId, referralCode) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          user_id: userId,
          code: referralCode,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to create referral:', error);
      throw error;
    }
  }

  async processReferral(referralCode, newUserId) {
    try {
      // Find referral
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('code', referralCode)
        .single();

      if (referralError) throw referralError;

      // Add credit to referrer
      const { error: creditError } = await supabase
        .from('user_credits')
        .insert({
          user_id: referral.user_id,
          amount: 10.00,
          type: 'referral',
          description: `Referral bonus for user ${newUserId}`
        });

      if (creditError) throw creditError;

      // Update referral status
      const { error: updateError } = await supabase
        .from('referrals')
        .update({ status: 'completed' })
        .eq('id', referral.id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      logger.error('Failed to process referral:', error);
      throw error;
    }
  }
}

export const referralService = new ReferralService();