import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

interface OAuthState {
  state: string;
  timestamp: number;
  nonce: string;
}

const STATE_SECRET = process.env.OAUTH_STATE_SECRET || 'default-secret-change-in-production';
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export class OAuthStateManager {
  private static states = new Map<string, OAuthState>();

  /**
   * Generate a cryptographically secure state parameter
   */
  static generateState(): string {
    const nonce = randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const state = randomBytes(32).toString('hex');
    
    // Create HMAC for integrity verification
    const hmac = createHmac('sha256', STATE_SECRET);
    hmac.update(state);
    hmac.update(nonce);
    hmac.update(timestamp.toString());
    const signature = hmac.digest('hex');
    
    const fullState = `${state}.${nonce}.${timestamp}.${signature}`;
    
    // Store state for validation
    this.states.set(state, {
      state,
      timestamp,
      nonce
    });
    
    // Clean up expired states
    this.cleanupExpiredStates();
    
    return fullState;
  }

  /**
   * Validate state parameter against stored value
   */
  static validateState(receivedState: string): boolean {
    if (!receivedState || typeof receivedState !== 'string') {
      return false;
    }

    const parts = receivedState.split('.');
    if (parts.length !== 4) {
      return false;
    }

    const [state, nonce, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if state is expired
    if (Date.now() - timestamp > STATE_EXPIRY_MS) {
      return false;
    }

    // Verify HMAC signature
    const expectedHmac = createHmac('sha256', STATE_SECRET);
    expectedHmac.update(state);
    expectedHmac.update(nonce);
    expectedHmac.update(timestamp.toString());
    const expectedSignature = expectedHmac.digest('hex');

    if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return false;
    }

    // Check if state exists in our store
    const storedState = this.states.get(state);
    if (!storedState) {
      return false;
    }

    // Verify stored state matches
    if (storedState.nonce !== nonce || storedState.timestamp !== timestamp) {
      return false;
    }

    // Remove used state to prevent replay attacks
    this.states.delete(state);
    
    return true;
  }

  /**
   * Clean up expired states
   */
  private static cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [key, state] of this.states.entries()) {
      if (now - state.timestamp > STATE_EXPIRY_MS) {
        this.states.delete(key);
      }
    }
  }
}
