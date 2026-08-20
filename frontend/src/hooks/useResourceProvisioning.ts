import { useState, useEffect } from 'react';
import { realtimeClient } from '../lib/realtimeClient';

export type ResourceStatus = 'Provisioning' | 'Running' | 'Failed' | 'Suspended' | 'Terminated' | string;

export function useResourceProvisioning(resourceType: string, resourceId: string, initialStatus: ResourceStatus = 'Provisioning') {
  const [status, setStatus] = useState<ResourceStatus>(initialStatus);

  useEffect(() => {
    // Luôn bắt đầu bằng status ban đầu từ DB
    setStatus(initialStatus);
    
    // Nếu status đã là Running, Failed, Suspended thì tuỳ, nhưng ta vẫn nên subscribe 
    // để nhỡ có action nào khác làm thay đổi.
    let isMounted = true;

    const setupRealtime = async () => {
      try {
        const conn = realtimeClient.getConnection();
        
        // Define handler
        const statusHandler = (id: string, newStatus: string) => {
          if (id === resourceId && isMounted) {
            setStatus(newStatus as ResourceStatus);
          }
        };

        // Lắng nghe sự kiện
        conn.on('StatusChanged', statusHandler);

        // Đảm bảo đã connect và subscribe
        await realtimeClient.subscribeToResource(resourceType, resourceId);

        // Cleanup function
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
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [resourceType, resourceId, initialStatus]);

  return status;
}
