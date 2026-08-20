import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class RealtimeClient {
  private connection: HubConnection | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  public getConnection(): HubConnection {
    if (!this.connection) {
      // Dùng URL base của API, cần có NEXT_PUBLIC_API_URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/resource-status`)
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();
    }
    return this.connection;
  }

  public async startConnection(): Promise<void> {
    if (this.connection?.state === 'Connected') return;
    if (this.isConnecting && this.connectionPromise) return this.connectionPromise;

    this.isConnecting = true;
    const conn = this.getConnection();

    this.connectionPromise = conn.start()
      .then(() => {
        console.log('Realtime resource status hub connected.');
        this.isConnecting = false;
      })
      .catch(err => {
        console.error('Realtime connection failed:', err);
        this.isConnecting = false;
        throw err;
      });

    return this.connectionPromise;
  }

  public async subscribeToResource(resourceType: string, resourceId: string): Promise<void> {
    await this.startConnection();
    await this.connection?.invoke('SubscribeToResource', resourceType, resourceId);
  }
}

export const realtimeClient = new RealtimeClient();
