import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

interface QuickBooksCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  realmId: string;
  clientId: string;
  clientSecret: string;
  obtainedAt: string;
  expiresAt: string;
}

export class CredentialManager {
  private static readonly ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || 'default-key-change-in-production';
  private static readonly ALGORITHM = 'aes-256-gcm';

  /**
   * Encrypt credentials before storage
   */
  private static encryptCredentials(credentials: QuickBooksCredentials): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Decrypt credentials after retrieval
   */
  private static decryptCredentials(encryptedData: string): QuickBooksCredentials {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    
    const decipher = createDecipheriv(
      this.ALGORITHM,
      Buffer.from(this.ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  /**
   * Store credentials securely (replace with your preferred storage method)
   */
  static async storeCredentials(credentials: QuickBooksCredentials, userId: string): Promise<void> {
    try {
      const encryptedCredentials = this.encryptCredentials(credentials);
      
      // TODO: Replace with your secure storage solution
      // Options: AWS Secrets Manager, HashiCorp Vault, encrypted database field, etc.
      
      // For now, store in environment variable (not recommended for production)
      // In production, use a proper secrets management service
      process.env[`QUICKBOOKS_CREDENTIALS_${userId}`] = encryptedCredentials;
      
      console.log('✅ Credentials stored securely');
    } catch (error) {
      console.error('❌ Failed to store credentials:', error);
      throw new Error('Credential storage failed');
    }
  }

  /**
   * Retrieve credentials securely
   */
  static async getCredentials(userId: string): Promise<QuickBooksCredentials | null> {
    try {
      const encryptedCredentials = process.env[`QUICKBOOKS_CREDENTIALS_${userId}`];
      
      if (!encryptedCredentials) {
        return null;
      }
      
      const credentials = this.decryptCredentials(encryptedCredentials);
      
      // Check if credentials are expired
      if (new Date(credentials.expiresAt) <= new Date()) {
        console.log('⚠️ Credentials expired, refresh needed');
        return null;
      }
      
      return credentials;
    } catch (error) {
      console.error('❌ Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Delete credentials
   */
  static async deleteCredentials(userId: string): Promise<void> {
    try {
      delete process.env[`QUICKBOOKS_CREDENTIALS_${userId}`];
      console.log('✅ Credentials deleted');
    } catch (error) {
      console.error('❌ Failed to delete credentials:', error);
      throw new Error('Credential deletion failed');
    }
  }

  /**
   * Check if credentials exist and are valid
   */
  static async hasValidCredentials(userId: string): Promise<boolean> {
    const credentials = await this.getCredentials(userId);
    return credentials !== null;
  }
}
