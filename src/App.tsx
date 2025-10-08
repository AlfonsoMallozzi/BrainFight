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

type GameState = 'team-select' | 'connecting' | 'waiting' | 'battle' | 'ended';
type GamePhase = 'question' | 'results' | 'ended';

interface RoomInfo {
  id: string;
  players: number;
  gamePhase: 'waiting' | 'question' | 'results' | 'ended';
  createdAt: string;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('team-select');
  const [gamePhase, setGamePhase] = useState<GamePhase>('question');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [winner, setWinner] = useState<Player | undefined>();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [roomsList, setRoomsList] = useState<RoomInfo[]>([]);

  const currentQuestion = malwareQuestions[currentQuestionIndex];

  // --- Poll all rooms ---
  useEffect(() => {
    if (gameState === 'team-select' || gameState === 'waiting') {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms`,
            {
              headers: { Authorization: `Bearer ${publicAnonKey}` },
            }
          );
          if (res.ok) {
            const data: RoomInfo[] = await res.json();
            setRoomsList(data);
          }
        } catch (e) {
          console.error('Error fetching rooms list:', e);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // --- Team selection / join ---
  const handleTeamSelect = async (team: Team, joinRoomId?: string) => {
    setSelectedTeam(team);
    const name = team === 'red' ? 'RedHacker' : 'BlueDefender';
    setPlayerName(name);
    setGameState('connecting');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ playerName: name, team, roomId: joinRoomId ?? undefined }),
        }
      );

      if (!response.ok) throw new Error(`Failed to join room: ${response.statusText}`);
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

  // --- Poll single room ---
  const startRoomPolling = (roomId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
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
      } catch (e) {
        console.error('Error polling room:', e);
      }
    }, 10000);
    return () => clearInterval(interval);
  };

  // --- Handle answer submission ---
  const handleAnswer = async (playerId: string, answerIndex: number) => {
    if (!roomId || !room) return;
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ playerId, answerIndex }),
        }
      );
      if (!res.ok) throw new Error('Failed to submit answer');
      const data = await res.json();
      if (data.allAnswered) setGamePhase('results');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // --- Handle next question ---
  const handleNextQuestion = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/next`,
        { method: 'POST', headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (res.ok) setGamePhase('question');
    } catch (error) {
      console.error('Error moving to next question:', error);
    }
  };

  // --- Start game ---
  const startGame = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/start`,
        { method: 'POST', headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (res.ok) {
        setGameState('battle');
        setGamePhase('question');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // --- Reset game ---
  const resetGame = () => {
    setGameState('team-select');
    setGamePhase('question');
    setSelectedTeam(null);
    setPlayerName('');
    setRoomId(null);
    setPlayerId(null);
    setPlayers([]);
    setRoom(null);
    setCurrentQuestionIndex(0);
    setWinner(undefined);
    setConnectionError(null);
  };

  // --- Rooms Panel ---
  const RoomsPanel = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/80 border-r border-gray-700 p-4 overflow-y-auto z-50">
      <h3 className="text-white font-bold mb-4">Available Rooms</h3>
      {roomsList.length === 0 && <p className="text-gray-400">No rooms yet...</p>}
      {roomsList.map(room => (
        <div key={room.id}
          className="bg-gray-800/50 text-white p-2 mb-2 rounded cursor-pointer hover:bg-gray-700"
          onClick={() => {
            if (selectedTeam) handleTeamSelect(selectedTeam, room.id);
          }}
        >
          <p>Room: {room.id.slice(0,8)}</p>
          <p>Players: {room.players}/100</p>
          <p>Phase: {room.gamePhase}</p>
        </div>
      ))}
    </div>
  );

  // --- UI Rendering ---
  if (gameState === 'team-select') {
    return (
      <div>
        <RoomsPanel />
        <TeamSelection onTeamSelect={handleTeamSelect} />
        {connectionError && (
          <div className="fixed top-4 left-4 right-4 bg-red-900/90 text-red-200 p-4 rounded-lg border border-red-600">
            {connectionError}
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-red-400">Connecting to Battle Arena...</h2>
          <p className="text-gray-300 mt-2">Finding opponents...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <RoomsPanel />
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-2xl text-white mb-4">Waiting for players...</h2>
          <p className="text-gray-300">Room ID: {roomId}</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mt-4"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'battle' && currentQuestion) {
    return (
      <BattleArena
        players={players}
        currentQuestion={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={malwareQuestions.length}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        gamePhase={gamePhase}
        winner={winner}
        currentPlayerId={playerId}
      />
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {winner ? (
            <h2 className="text-3xl font-bold text-yellow-400">Winner: {winner.name}</h2>
          ) : (
            <h2 className="text-3xl font-bold text-gray-400">No winner</h2>
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mt-4"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

