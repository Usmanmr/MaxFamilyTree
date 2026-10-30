import express from 'express';
import path from 'path';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, updateUserProfile } from './src/db/users.ts';
import {
  getAllTreesForUser,
  getTreeDetails,
  getRecentActivities,
  createTree,
  deleteTreeById,
  createPerson,
  updatePersonById,
  batchUpdatePersonPositions,
  deletePersonById,
  createRelationship,
  deleteRelationshipById,
} from './src/db/trees.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const httpServer = createHttpServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' },
});

app.use(express.json({ limit: '10mb' }));

// Socket.IO logic
io.on('connection', (socket) => {
  socket.on('join-tree', (treeId) => {
    socket.join(`tree:${treeId}`);
    io.to(`tree:${treeId}`).emit('tree-presence', [{ id: socket.id, name: 'Active User' }]);
  });

  socket.on('leave-tree', (treeId) => {
    socket.leave(`tree:${treeId}`);
  });

  socket.on('person-moved', (data) => {
    socket.to(`tree:${data.treeId}`).emit('person-moved', data);
  });

  socket.on('person-updated', (data) => {
    socket.to(`tree:${data.treeId}`).emit('person-updated', data);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || 'user@example.com';
    const displayName = req.user!.name || '';
    const parts = displayName.trim().split(' ');
    const firstName = parts[0] || email.split('@')[0];
    const lastName = parts.slice(1).join(' ') || '';
    const avatarUrl = req.user!.picture || null;

    const user = await getOrCreateUser(uid, email, firstName, lastName, avatarUrl);
    res.json(user);
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

app.patch('/api/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { firstName, lastName, avatarUrl } = req.body;
    const updated = await updateUserProfile(uid, { firstName, lastName, avatarUrl });
    res.json(updated);
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update user profile' });
  }
});

app.get('/api/trees', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const trees = await getAllTreesForUser(uid);
    const activityLog = await getRecentActivities();
    res.json({ trees, activityLog });
  } catch (error: any) {
    console.error('Failed to fetch trees:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch trees' });
  }
});

app.post('/api/trees', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const { id, name, description, privacy } = req.body;
    const treeId = id || Math.random().toString(36).substring(2, 9);
    const created = await createTree({
      id: treeId,
      ownerUid: uid,
      name: name || 'Untitled Tree',
      description,
      privacy,
    });
    res.status(201).json(created);
  } catch (error: any) {
    console.error('Failed to create tree:', error);
    res.status(500).json({ error: error.message || 'Failed to create tree' });
  }
});

app.delete('/api/trees/:treeId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId } = req.params;
    const result = await deleteTreeById(treeId);
    res.json(result);
  } catch (error: any) {
    console.error('Failed to delete tree:', error);
    res.status(500).json({ error: error.message || 'Failed to delete tree' });
  }
});

app.get('/api/trees/:treeId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId } = req.params;
    const details = await getTreeDetails(treeId);
    res.json(details);
  } catch (error: any) {
    console.error('Failed to fetch tree details:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tree details' });
  }
});

app.post('/api/trees/:treeId/persons', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId } = req.params;
    const uid = req.user!.uid;
    const person = await createPerson(treeId, uid, req.body);
    res.status(201).json(person);
  } catch (error: any) {
    console.error('Failed to create person:', error);
    res.status(500).json({ error: error.message || 'Failed to create person' });
  }
});

app.patch('/api/trees/:treeId/persons/:personId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId, personId } = req.params;
    const uid = req.user!.uid;
    const updated = await updatePersonById(treeId, personId, uid, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Failed to update person:', error);
    res.status(500).json({ error: error.message || 'Failed to update person' });
  }
});

app.put('/api/trees/:treeId/positions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId } = req.params;
    const uid = req.user!.uid;
    const { positions } = req.body;
    const result = await batchUpdatePersonPositions(treeId, uid, positions || {});
    res.json(result);
  } catch (error: any) {
    console.error('Failed to save positions:', error);
    res.status(500).json({ error: error.message || 'Failed to save positions' });
  }
});

app.delete('/api/trees/:treeId/persons/:personId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId, personId } = req.params;
    const uid = req.user!.uid;
    const result = await deletePersonById(treeId, personId, uid);
    res.json(result);
  } catch (error: any) {
    console.error('Failed to delete person:', error);
    res.status(500).json({ error: error.message || 'Failed to delete person' });
  }
});

app.post('/api/trees/:treeId/relationships', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId } = req.params;
    const rel = await createRelationship(treeId, req.body);
    res.status(201).json(rel);
  } catch (error: any) {
    console.error('Failed to create relationship:', error);
    res.status(500).json({ error: error.message || 'Failed to create relationship' });
  }
});

app.delete('/api/trees/:treeId/relationships/:relId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { treeId, relId } = req.params;
    const result = await deleteRelationshipById(treeId, relId);
    res.json(result);
  } catch (error: any) {
    console.error('Failed to delete relationship:', error);
    res.status(500).json({ error: error.message || 'Failed to delete relationship' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  import('vite').then(({ createServer }) => {
    createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Development server started on port ${PORT}`);
      });
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server started on port ${PORT}`);
  });
}
