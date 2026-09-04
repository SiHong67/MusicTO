import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MEMBERS } from './src/data/mockMembers';
import { Member, StationId, StationEvaluation } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory data store for live multi-device synchronization
  let members: Member[] = JSON.parse(JSON.stringify(INITIAL_MEMBERS));

  // --- API Routes FIRST ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', membersCount: members.length });
  });

  // Get all members
  app.get('/api/members', (req, res) => {
    res.json({ members });
  });

  // Register or update a candidate
  app.post('/api/members', (req, res) => {
    const candidate: Member = req.body;
    if (!candidate || !candidate.id) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    const existingIndex = members.findIndex((m) => m.id === candidate.id);
    if (existingIndex >= 0) {
      // Merge updates
      members[existingIndex] = {
        ...members[existingIndex],
        ...candidate,
      };
    } else {
      // Prepend newly registered candidate
      members.unshift(candidate);
    }

    res.json({ success: true, member: candidate, members });
  });

  // Station check-in (e.g. Mark scans Keyboard QR on his phone)
  app.post('/api/members/:id/checkin', (req, res) => {
    const { id } = req.params;
    const { stationId } = req.body as { stationId: StationId };

    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    const member = members.find((m) => m.id === id);
    if (!member) {
      return res.status(404).json({ error: `Member ${id} not found` });
    }

    const checkedInStations = member.checkedInStations.includes(stationId)
      ? member.checkedInStations
      : [...member.checkedInStations, stationId];

    member.currentStation = stationId;
    member.checkedInStations = checkedInStations;

    res.json({ success: true, member });
  });

  // Save instructor remarks & evaluation
  app.post('/api/members/:id/evaluation', (req, res) => {
    const { id } = req.params;
    const { stationId, evaluation } = req.body as {
      stationId: StationId;
      evaluation: StationEvaluation;
    };

    if (!stationId || !evaluation) {
      return res.status(400).json({ error: 'stationId and evaluation are required' });
    }

    const member = members.find((m) => m.id === id);
    if (!member) {
      return res.status(404).json({ error: `Member ${id} not found` });
    }

    member.evaluations = {
      ...member.evaluations,
      [stationId]: evaluation,
    };

    res.json({ success: true, member });
  });

  // Reset to sample initial candidates
  app.post('/api/reset', (req, res) => {
    members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    res.json({ success: true, members });
  });

  // --- Vite middleware integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MusicTO Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
