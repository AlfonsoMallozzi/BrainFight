import { useState, useEffect } from 'react';
import { TeamSelection, Team } from './components/TeamSelection';
import { BattleArena } from './components/BattleArena';
import { malwareQuestions, Question } from './data/questions';
import { projectId, publicAnonKey } from './utils/supabase/info';

interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  shield: number;
  team: 'red' | 'blue';
  isAlive: boolean;
  lastAnswer?: string;
}

interface GameRoom {
  id: string;
  players: string[];
  currentQuestion: number;
  gamePhase: 'waiting' | 'question' | 'results' | 'ended';
  answers: Record<string, number>;
}

type GameState = 'main-menu' | 'team-select' | 'connecting' | 'waiting' | 'battle' | 'ended';
type GamePhase = 'question' | 'results' | 'ended';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('main-menu');
  const [gamePhase, setGamePhase] = useState<GamePhase>('question');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [winner, setWinner] = useState<Player | undefined>();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const currentQuestion = malwareQuestions[currentQuestionIndex];

  // === MAIN MENU ===
  if (gameState === 'main-menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-red-400 mb-8">🔥 BATTLE ARENA 🔥</h1>
        <button
          onClick={() => setGameState('team-select')}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Create/Join New Room
        </button>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            className="px-4 py-2 rounded border border-gray-600 bg-gray-900 text-white"
          />
          <button
            onClick={() => {
              if (!roomIdInput) return;
              setRoomId(roomIdInput);
              setGameState('team-select'); // join then select team
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  // === TEAM SELECTION ===
  const handleTeamSelect = async (team: Team) => {
    setSelectedTeam(team);
    const name = team === 'red' ? 'RedHacker' : 'BlueDefender';
    setPlayerName(name);
    setGameState('connecting');

    try {
      // Join/create room
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          playerName: name,
          team,
          roomId: roomId // send roomId if joining existing
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to join room: ${response.statusText}`);
      }

      const data = await response.json();
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setRoom(data.room);
      setGameState('waiting');

      startRoomPolling(data.roomId);
    } catch (error) {
      console.error('Error joining room:', error);
      setConnectionError(`Failed to connect: ${error}`);
      setGameState('team-select');
    }
  };

  // === ROOM POLLING ===
  const startRoomPolling = (roomId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRoom(data.room);
          setPlayers(data.players);
          setCurrentQuestionIndex(data.room.currentQuestion);

          if (data.room.gamePhase === 'question') {
            setGamePhase('question');
            setGameState('battle');
          } else if (data.room.gamePhase === 'results') {
            setGamePhase('results');
          } else if (data.room.gamePhase === 'ended') {
            setGamePhase('ended');
            setGameState('ended');
            const alivePlayers = data.players.filter((p: Player) => p.isAlive);
            if (alivePlayers.length > 0) {
              const winner = alivePlayers.reduce((prev: Player, current: Player) =>
                prev.health > current.health ? prev : current
              );
              setWinner(winner);
            }
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error polling room:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  // === REST OF LOGIC ===
  const handleAnswer = async (playerId: string, answerIndex: number) => {
    if (!roomId || !room) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ playerId, answerIndex })
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      const data = await response.json();
      if (data.allAnswered) setGamePhase('results');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = async () => {
    if (!roomId) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/next`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (response.ok) setGamePhase('question');
    } catch (error) {
      console.error('Error moving to next question:', error);
    }
  };

  const startGame = async () => {
    if (!roomId) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (response.ok) {
        setGameState('battle');
        setGamePhase('question');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const resetGame = () => {
    setGameState('main-menu');
    setGamePhase('question');
    setSelectedTeam(null);
    setPlayerName('');
    setRoomIdInput('');
    setRoomId(null);
    setPlayerId(null);
    setPlayers([]);
    setRoom(null);
    setCurrentQuestionIndex(0);
    setWinner(undefined);
    setConnectionError(null);
  };

  // === TEAM SELECTION UI ===
  if (gameState === 'team-select') {
    return <TeamSelection onTeamSelect={handleTeamSelect} />;
  }

  // === CONNECTING / WAITING / BATTLE / ENDED ===
  if (gameState === 'connecting') return <div>Connecting...</div>;
  if (gameState === 'waiting') return <div>Waiting for players...</div>;
  if (gameState === 'battle' && currentQuestion)
    return <BattleArena players={players} currentQuestion={currentQuestion} questionNumber={currentQuestionIndex + 1} totalQuestions={malwareQuestions.length} onAnswer={handleAnswer} onNextQuestion={handleNextQuestion} gamePhase={gamePhase} winner={winner} currentPlayerId={playerId} />;
  if (gameState === 'ended') return <div>Game ended. <button onClick={resetGame}>Play Again</button></div>;

  return null;
}
