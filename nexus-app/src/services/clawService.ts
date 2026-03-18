export interface ClawAction {
  type: 'click' | 'type' | 'hotkey' | 'scroll' | 'drag' | 'move';
  x?: number;
  y?: number;
  text?: string;
  keys?: string[];
  clicks?: number;
  button?: 'left' | 'right' | 'middle';
  scroll_amount?: number;
}

export type SafetyTier = 'ghost' | 'guided' | 'locked';

export class ClawService {
  private readonly baseUrl = 'http://localhost:1421';

  /**
   * Captures the screen and returns a base64 encoded JPEG.
   */
  async getScreenshot(): Promise<string | null> {
    try {
      const res = await fetch(`${this.baseUrl}/vision/screenshot`);
      const data = await res.json();
      if (data.success && data.image) {
        return data.image; // data:image/jpeg;base64,...
      }
      return null;
    } catch (e) {
      console.error('Failed to get screenshot:', e);
      return null;
    }
  }

  /**
   * Executes a desktop interaction action via the Python sidecar.
   */
  async executeAction(action: ClawAction): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/claw/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to execute claw action:', e);
      return { success: false, error: String(e) };
    }
  }

  /**
   * Updates the safety tier of the engine.
   */
  async setSafetyTier(tier: SafetyTier): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/claw/safety`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error('Failed to set safety tier:', e);
      return false;
    }
  }
}

export const clawService = new ClawService();
