import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from './kv_store.tsx';

interface GameRoom {
  id: string;
  players: string[];
  currentQuestion: number;
  gamePhase: 'waiting' | 'question' | 'results' | 'ended';
  answers: Record<string, number>;
  createdAt: string;
}

interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  shield: number;
  team: 'red' | 'blue';
  isAlive: boolean;
}

const app = new Hono();
app.use('*', cors({ origin: '*', allowHeaders: ['*'], allowMethods: ['*'] }));
app.use('*', logger(console.log));

// --- Join or create room ---
app.post('/make-server-83bde5a9/rooms/join', async (c) => {
  try {
    const { playerName, team, roomId } = await c.req.json();
    if (!playerName || !team) return c.text('Missing playerName or team', 400);

    let targetRoom: GameRoom | null = null;

    if (roomId) {
      targetRoom = await kv.get(`room:${roomId}`) as GameRoom;
      if (!targetRoom) return c.text('Room not found', 404);
    } else {
      const rooms = await kv.getByPrefix('room:');
      for (const r of rooms) {
        const room = r.value as GameRoom;
        if (room.players.length < 100 && room.gamePhase === 'waiting') {
          targetRoom = room;
          break;
        }
      }
    }

    const playerId = crypto.randomUUID();
    const player: Player = {
      id: playerId,
      name: playerName,
      health: 100,
      maxHealth: 100,
      shield: 0,
      team,
      isAlive: true
    };

    if (!targetRoom) {
      const id = crypto.randomUUID();
      targetRoom = {
        id,
        players: [playerId],
        currentQuestion: 0,
        gamePhase: 'waiting',
        answers: {},
        createdAt: new Date().toISOString()
      };
      await kv.set(`room:${id}`, targetRoom);
    } else {
      targetRoom.players.push(playerId);
      await kv.set(`room:${targetRoom.id}`, targetRoom);
    }

    await kv.set(`player:${playerId}`, player);

    return c.json({ roomId: targetRoom.id, playerId, player, room: targetRoom });
  } catch (e) {
    console.log(e);
    return c.text(`Error joining room: ${e}`, 500);
  }
});

// --- Get all rooms ---
app.get('/make-server-83bde5a9/rooms', async (c) => {
  try {
    const roomsData = await kv.getByPrefix('room:');
    const rooms = roomsData.map(r => {
      const room = r.value as GameRoom;
      return {
        id: room.id,
        players: room.players.length,
        gamePhase: room.gamePhase,
        createdAt: room.createdAt
      };
    });
    return c.json(rooms);
  } catch (e) {
    console.log(e);
    return c.text(`Error fetching rooms: ${e}`, 500);
  }
});

// --- Get single room ---
app.get('/make-server-83bde5a9/rooms/:roomId', async (c) => {
  const roomId = c.req.param('roomId');
  const room = await kv.get(`room:${roomId}`) as GameRoom;
  if (!room) return c.text('Room not found', 404);

  const players: Player[] = [];
  for (const pid of room.players) {
    const p = await kv.get(`player:${pid}`) as Player;
    if (p) players.push(p);
  }

  return c.json({ room, players });
});

// --- Start game ---
app.post('/make-server-83bde5a9/rooms/:roomId/start', async (c) => {
  const roomId = c.req.param('roomId');
  const room = await kv.get(`room:${roomId}`) as GameRoom;
  if (!room) return c.text('Room not found', 404);
  if (room.players.length < 2) return c.text('Need at least 2 players', 400);

  room.gamePhase = 'question';
  room.currentQuestion = 0;
  room.answers = {};
  await kv.set(`room:${roomId}`, room);
  return c.json({ success: true, room });
});

serve(app.fetch);
