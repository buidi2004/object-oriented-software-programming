import { useState, useEffect, useMemo } from 'react';
import { realtimeClient } from '../lib/realtimeClient';

export type ResourceStatus = 'Pending' | 'Provisioning' | 'Deploying' | 'Running' | 'Active' | 'Ready' | 'Failed' | 'Suspended' | 'Terminated' | string;

export const SERVICE_TIMEOUT_SECONDS: Record<string, number> = {
  ManagedDatabaseInstance: 60,
  DatabaseInstance: 60,
  Databases: 60,
  ObjectStorageBucket: 60,
  StorageBucket: 60,
  Storage: 60,
  StaticSiteProject: 60,
  StaticSite: 60,
  AppInstallation: 90,
  AppInstaller: 90,
  GameServerInstance: 120,
  GameServer: 120,
  SslCertificate: 90,
  Ssl: 90,
};

export interface UseResourceProvisioningReturn {
  status: ResourceStatus;
  isProvisioning: boolean;
  isSlow: boolean;
  elapsedSeconds: number;
  timeoutSeconds: number;
  slowWarningText: string;
}

export function useResourceProvisioning(
  resourceType: string,
  resourceId: string,
  initialStatus: ResourceStatus = 'Provisioning'
): ResourceStatus {
  const { status } = useResourceProvisioningDetails(resourceType, resourceId, initialStatus);
  return status;
}

export function useResourceProvisioningDetails(
  resourceType: string,
  resourceId: string,
  initialStatus: ResourceStatus = 'Provisioning'
): UseResourceProvisioningReturn {
  const [status, setStatus] = useState<ResourceStatus>(initialStatus);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const timeoutSeconds = useMemo(() => {
    return SERVICE_TIMEOUT_SECONDS[resourceType] || 60;
  }, [resourceType]);

  const isProvisioning = useMemo(() => {
    return status === 'Pending' || status === 'Provisioning' || status === 'Deploying';
  }, [status]);

  const isSlow = isProvisioning && elapsedSeconds >= timeoutSeconds;

  // Realtime SignalR listener
  useEffect(() => {
    setStatus(initialStatus);
    let isMounted = true;

    const setupRealtime = async () => {
      try {
        const conn = realtimeClient.getConnection();

        const statusHandler = (id: string, newStatus: string) => {
          if (id === resourceId && isMounted) {
            setStatus(newStatus as ResourceStatus);
          }
        };

        conn.on('StatusChanged', statusHandler);
        await realtimeClient.subscribeToResource(resourceType, resourceId);

        return () => {
          conn.off('StatusChanged', statusHandler);
        };
      } catch (err) {
        console.error('Failed to setup realtime for', resourceType, resourceId, err);
      }
    };

    const cleanupPromise = setupRealtime();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [resourceType, resourceId, initialStatus]);

  // Elapsed timer when in provisioning state
  useEffect(() => {
    if (!isProvisioning) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isProvisioning]);

  return {
    status,
    isProvisioning,
    isSlow,
    elapsedSeconds,
    timeoutSeconds,
    slowWarningText: `Hệ thống đang mất nhiều thời gian hơn dự kiến (${elapsedSeconds}s / ${timeoutSeconds}s). Quá trình khởi tạo trên máy chủ thật vẫn đang được tiếp tục xử lý...`,
  };
}
