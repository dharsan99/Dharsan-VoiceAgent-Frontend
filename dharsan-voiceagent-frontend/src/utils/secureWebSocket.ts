// Secure WebSocket utility with OIDC authentication
export class SecureWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessageCallback: ((data: any) => void) | null = null;
  private onOpenCallback: (() => void) | null = null;
  private onCloseCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;
  private backendUrl: string;
  private oidcToken?: string;

  constructor(backendUrl: string, oidcToken?: string) {
    this.backendUrl = backendUrl;
    this.oidcToken = oidcToken;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For now, we'll connect directly to the backend
        // In production, you would use the OIDC token for authentication
        this.ws = new WebSocket(this.backendUrl);

        this.ws.onopen = () => {
          console.log('Secure WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Send OIDC token if available
          if (this.oidcToken) {
            this.ws?.send(JSON.stringify({
              type: 'auth',
              token: this.oidcToken
            }));
          }
          
          this.onOpenCallback?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.onMessageCallback?.(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.onCloseCallback?.();
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.onErrorCallback?.(error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client initiated close');
      this.ws = null;
    }
  }

  onMessage(callback: (data: any) => void): void {
    this.onMessageCallback = callback;
  }

  onOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Helper function to get OIDC token from Vercel
export async function getOIDCToken(): Promise<string | null> {
  try {
    // In a real implementation, you would get the OIDC token from Vercel
    // For now, we'll return null and handle authentication differently
    return null;
  } catch (error) {
    console.error('Failed to get OIDC token:', error);
    return null;
  }
} 