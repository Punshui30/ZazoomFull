import CryptoJS from 'crypto-js';
import { saveAs } from 'file-saver';
import { supabase } from './supabase';
import toast from 'react-hot-toast';

export class SecurityManager {
  private static readonly MAX_LOGIN_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private static loginAttempts: { [ip: string]: { count: number; timestamp: number } } = {};
  private static lastActivity: number = Date.now();

  static async handleSecurityBreach() {
    try {
      console.log('Security breach detected!');
      await this.burnSystem();
    } catch (error) {
      console.error('Security breach handler failed:', error);
      toast.error('Security protocol failed');
    }
  }

  static async burnSystem(pin?: string) {
    try {
      // Verify PIN if provided
      if (pin) {
        const { data: settings } = await supabase
          .from('manual_access_keys')
          .select('key')
          .single();

        if (!settings || settings.key !== pin) {
          throw new Error('Invalid PIN');
        }
      }

      // Create encrypted backup
      const encryptedBackup = await this.encryptAllData();
      
      // Save backup locally
      const blob = new Blob(
        [JSON.stringify(encryptedBackup)],
        { type: 'application/json;charset=utf-8' }
      );
      saveAs(blob, `zazoom-backup-${new Date().toISOString()}.enc`);

      // Send encrypted backup to admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_backups').insert({
          user_id: user.id,
          encrypted_data: encryptedBackup,
          created_at: new Date().toISOString()
        });
      }

      // Clear local data
      localStorage.clear();
      sessionStorage.clear();

      // Log the burn event
      await supabase.from('admin_audit_logs').insert({
        user_id: user?.id,
        action: 'emergency_burn',
        details: { triggered_by: pin ? 'manual' : 'automatic' }
      });

      // Redirect to security breach page
      window.location.href = '/security-breach';
    } catch (error) {
      console.error('Burn protocol failed:', error);
      toast.error('Emergency protocol failed');
      throw error;
    }
  }

  static async encryptAllData() {
    try {
      // Fetch all sensitive data
      const { data: userData } = await supabase.auth.getUser();
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: profile } = await supabase.from('profiles').select('*').single();

      const data = {
        user: userData,
        orders,
        profile,
        timestamp: new Date().toISOString()
      };

      // Generate encryption key
      const key = CryptoJS.lib.WordArray.random(256/8);
      const iv = CryptoJS.lib.WordArray.random(128/8);

      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      return {
        data: encrypted.toString(),
        iv: iv.toString(),
        key: key.toString()
      };
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw error;
    }
  }

  static async recordLoginAttempt(email: string, success: boolean) {
    try {
      const ip = 'client-ip'; // In production, get from request headers
      const attempts = this.loginAttempts[ip] || { count: 0, timestamp: Date.now() };

      if (success) {
        delete this.loginAttempts[ip];
        return true;
      }

      if (Date.now() - attempts.timestamp > this.LOCKOUT_DURATION) {
        attempts.count = 1;
        attempts.timestamp = Date.now();
      } else {
        attempts.count++;
      }

      this.loginAttempts[ip] = attempts;

      // Log failed attempt
      await supabase.from('admin_access_attempts').insert({
        ip_address: ip,
        attempt_count: attempts.count,
        success: false
      });

      if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
        await this.handleSecurityBreach();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to record login attempt:', error);
      return false;
    }
  }

  static async logout() {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  }
}