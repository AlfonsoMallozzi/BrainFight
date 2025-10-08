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

// Create or join a game room
app.post('/make-server-83bde5a9/rooms/join', async (c) => {
  try {
    const { playerName, team } = await c.req.json();
    if (!playerName || !team) return new Response('Missing playerName or team', { status: 400 });

    const existingRooms = await kv.getByPrefix('room:');
    let targetRoom: GameRoom | null = null;

    for (const roomData of existingRooms) {
      const room = roomData.value as GameRoom;
      if (room.players.length < 100 && room.gamePhase === 'waiting') {
        targetRoom = room;
        break;
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
      // Create new room
      const roomId = crypto.randomUUID();
      targetRoom = {
        id: roomId,
        players: [playerId],
        currentQuestion: 0,
        gamePhase: 'waiting',
        answers: {},
        createdAt: new Date().toISOString()
      };
      await kv.set(`room:${roomId}`, targetRoom);
    } else {
      // Join existing room atomically
      try {
        await kv.addPlayerToRoom(`room:${targetRoom.id}`, playerId);
      } catch (err: any) {
        if (err.message === 'room-not-found') return new Response('Room not found', { status: 404 });
        if (err.message === 'room-full') return new Response('Room is full', { status: 400 });
        throw err;
      }
    }

    await kv.set(`player:${playerId}`, player);

    return c.json({ roomId: targetRoom.id, playerId, player, room: targetRoom });
  } catch (error) {
    console.log('Error joining room:', error);
    return new Response(`Error joining room: ${error}`, { status: 500 });
  }
});

// Start game in room
app.post('/make-server-83bde5a9/rooms/:roomId/start', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const room = await kv.get(`room:${roomId}`) as GameRoom;
    if (!room) return new Response('Room not found', { status: 404 });
    if (room.players.length < 2) return new Response('Need at least 2 players to start', { status: 400 });

    room.gamePhase = 'question';
    room.currentQuestion = 0;
    room.answers = {};
    await kv.set(`room:${roomId}`, room);

    return c.json({ success: true, room });
  } catch (error) {
    console.log('Error starting game:', error);
    return new Response(`Error starting game: ${error}`, { status: 500 });
  }
});

// Submit answer
app.post('/make-server-83bde5a9/rooms/:roomId/answer', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const { playerId, answerIndex } = await c.req.json();
    const room = await kv.get(`room:${roomId}`) as GameRoom;
    if (!room) return new Response('Room not found', { status: 404 });

    room.answers[playerId] = answerIndex;
    await kv.set(`room:${roomId}`, room);

    const allAnswered = room.players.every(pid => room.answers[pid] !== undefined);
    if (allAnswered) await processQuestionResults(room);

    return c.json({ success: true, allAnswered });
  } catch (error) {
    console.log('Error submitting answer:', error);
    return new Response(`Error submitting answer: ${error}`, { status: 500 });
  }
});

// Get room status
app.get('/make-server-83bde5a9/rooms/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const room = await kv.get(`room:${roomId}`) as GameRoom;
    if (!room) return new Response('Room not found', { status: 404 });

    const players: Player[] = [];
    for (const playerId of room.players) {
      const player = await kv.get(`player:${playerId}`) as Player;
      if (player) players.push(player);
    }

    return c.json({ room, players });
  } catch (error) {
    console.log('Error getting room:', error);
    return new Response(`Error getting room: ${error}`, { status: 500 });
  }
});

// Process question results
async function processQuestionResults(room: GameRoom) {
  const correctAnswer = 1;
  for (const playerId of room.players) {
    const player = await kv.get(`player:${playerId}`) as Player;
    if (!player || !player.isAlive) continue;

    const playerAnswer = room.answers[playerId];

    if (playerAnswer === correctAnswer) {
      if (player.team === 'red') {
        const opponents = room.players.filter(pid => {
          const p = kv.get(`player:${pid}`) as any;
          return p && p.id !== playerId && p.isAlive;
        });

        if (opponents.length > 0) {
          const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
          const opponent = await kv.get(`player:${randomOpponent}`) as Player;
          if (opponent) {
            const damage = Math.max(0, 10 - opponent.shield);
            opponent.health = Math.max(0, opponent.health - damage);
            opponent.shield = Math.max(0, opponent.shield - 10);
            if (opponent.health <= 0) opponent.isAlive = false;
            await kv.set(`player:${randomOpponent}`, opponent);
          }
        }
      } else if (player.team === 'blue') {
        player.shield += 11;
      }
    } else {
      const damage = Math.max(0, 25 - player.shield);
      player.health = Math.max(0, player.health - damage);
      player.shield = Math.max(0, player.shield - 25);
      if (player.health <= 0) player.isAlive = false;
    }

    await kv.set(`player:${playerId}`, player);
  }

  room.gamePhase = 'results';
  await kv.set(`room:${room.id}`, room);

  const alivePlayers = [];
  for (const pid of room.players) {
    const p = await kv.get(`player:${pid}`) as Player;
    if (p && p.isAlive) alivePlayers.push(p);
  }

  if (alivePlayers.length <= 1 || room.currentQuestion >= 14) {
    room.gamePhase = 'ended';
    await kv.set(`room:${room.id}`, room);
  }
}

// Next question
app.post('/make-server-83bde5a9/rooms/:roomId/next', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const room = await kv.get(`room:${roomId}`) as GameRoom;
    if (!room) return new Response('Room not found', { status: 404 });

    room.currentQuestion++;
    room.answers = {};
    room.gamePhase = 'question';
    await kv.set(`room:${roomId}`, room);

    return c.json({ success: true, room });
  } catch (error) {
    console.log('Error moving to next question:', error);
    return new Response(`Error moving to next question: ${error}`, { status: 500 });
  }
});

serve(app.fetch);

