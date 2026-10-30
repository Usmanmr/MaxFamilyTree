import { io, Socket } from 'socket.io-client';
import { useEffect } from 'react';
import { useTreeStore } from '../store/treeStore';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io({
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
};

export function useTreeSocket(treeId: string | null) {
  const store = useTreeStore();

  useEffect(() => {
    if (!treeId) return;

    const s = getSocket();

    s.emit('join-tree', treeId);

    s.on('tree-presence', (users) => {
      // Could update a presence store if needed
      console.log('tree presence updated:', users);
    });

    s.on('person-moved', (data) => {
      if (data.treeId === treeId) {
        store.updatePersonPosition(data.personId, data.x, data.y);
      }
    });

    s.on('person-updated', (data) => {
      // Generic update locally
    });

    return () => {
      s.emit('leave-tree', treeId);
      s.off('tree-presence');
      s.off('person-moved');
      s.off('person-updated');
    };
  }, [treeId, store]);

  return { socket: getSocket() };
}
