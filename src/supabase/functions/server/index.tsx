import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
  team?: 'red' | 'blue'; // optional now
  isAlive: boolean;
}

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

// === STEP 1: JOIN ROOM WITHOUT TEAM ===
app.post('/make-server-83bde5a9/rooms/join', async (c) => {
  try {
    const { playerName, roomId } = await c.req.json();
    
    if (!playerName) return new Response('Missing playerName', { status: 400 });

    let targetRoom: GameRoom | null = null;

    if (roomId) {
      // Join existing room by ID
      const roomData = await kv.get(`room:${roomId}`);
      if (!roomData.value) return new Response('Room not found', { status: 404 });
      targetRoom = roomData.value as GameRoom;
    } else {
      // Find waiting room
      const existingRooms = await kv.getByPrefix('room:');
      targetRoom = existingRooms.find(r => r.value.players.length < 100 && r.value.gamePhase === 'waiting')?.value as GameRoom ?? null;
      
      if (!targetRoom) {
        // Create new room
        const newRoomId = crypto.randomUUID();
        targetRoom = {
          id: newRoomId,
          players: [],
          currentQuestion: 0,
          gamePhase: 'waiting',
          answers: {},
          createdAt: new Date().toISOString()
        };
        await kv.set(`room:${newRoomId}`, targetRoom);
      }
    }

    const playerId = crypto.randomUUID();
    const player: Player = {
      id: playerId,
      name: playerName,
      health: 100,
      maxHealth: 100,
      shield: 0,
      isAlive: true
    };

    targetRoom.players.push(playerId);
    await kv.set(`room:${targetRoom.id}`, targetRoom);
    await kv.set(`player:${playerId}`, player);

    return c.json({
      roomId: targetRoom.id,
      playerId,
      player,
      room: targetRoom
    });
  } catch (error) {
    console.log('Error joining room:', error);
    return new Response(`Error joining room: ${error}`, { status: 500 });
  }
});

// === STEP 2: SELECT TEAM AFTER JOINING ===
app.post('/make-server-83bde5a9/players/:playerId/select-team', async (c) => {
  try {
    const playerId = c.req.param('playerId');
    const { team } = await c.req.json();
    if (!team || !['red', 'blue'].includes(team)) return new Response('Invalid team', { status: 400 });

    const playerData = await kv.get(`player:${playerId}`);
    if (!playerData.value) return new Response('Player not found', { status: 404 });

    const player = playerData.value as Player;
    player.team = team as 'red' | 'blue';
    await kv.set(`player:${playerId}`, player);

    return c.json({ success: true, player });
  } catch (error) {
    console.log('Error selecting team:', error);
    return new Response(`Error selecting team: ${error}`, { status: 500 });
  }
});

// === START GAME ===
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

// === SUBMIT ANSWER ===
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

// === GET ROOM ===
app.get('/make-server-83bde5a9/rooms/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const room = await kv.get(`room:${roomId}`) as GameRoom;
    if (!room) return new Response('Room not found', { status: 404 });

    const players: Player[] = [];
    for (const pid of room.players) {
      const player = await kv.get(`player:${pid}`) as Player;
      if (player) players.push(player);
    }

    return c.json({ room, players });
  } catch (error) {
    console.log('Error getting room:', error);
    return new Response(`Error getting room: ${error}`, { status: 500 });
  }
});

// === PROCESS RESULTS ===
async function processQuestionResults(room: GameRoom) {
  const correctAnswer = 1;

  for (const pid of room.players) {
    const player = await kv.get(`player:${pid}`) as Player;
    if (!player || !player.isAlive || !player.team) continue;

    const playerAnswer = room.answers[pid];
    if (playerAnswer === correctAnswer) {
      if (player.team === 'red') {
        const opponents = room.players.filter(opId => opId !== pid);
        if (opponents.length) {
          const targetId = opponents[Math.floor(Math.random() * opponents.length)];
          const target = await kv.get(`player:${targetId}`) as Player;
          if (target) {
            const damage = Math.max(0, 10 - target.shield);
            target.health = Math.max(0, target.health - damage);
            target.shield = Math.max(0, target.shield - 10);
            if (target.health <= 0) target.isAlive = false;
            await kv.set(`player:${targetId}`, target);
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

    await kv.set(`player:${pid}`, player);
  }

  room.gamePhase = 'results';
  await kv.set(`room:${room.id}`, room);

  const aliveCount = (await Promise.all(room.players.map(async pid => {
    const p = await kv.get(`player:${pid}`) as Player;
    return p?.isAlive ? 1 : 0;
  }))).reduce((a, b) => a + b, 0);

  if (aliveCount <= 1 || room.currentQuestion >= 14) {
    room.gamePhase = 'ended';
    await kv.set(`room:${room.id}`, room);
  }
}

// === NEXT QUESTION ===
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
