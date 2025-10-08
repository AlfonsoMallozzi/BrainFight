import { useState, useEffect } from 'react';
import { TeamSelection, Team } from './components/TeamSelection';
import { BattleArena } from './components/BattleArena';
import { malwareQuestions } from './data/questions';
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

  const currentQuestion = malwareQuestions[currentQuestionIndex];

  // Team selection handler
  const handleTeamSelect = async (team: Team) => {
    setSelectedTeam(team);
    const name = team === 'red' ? 'RedHacker' : 'BlueDefender';
    setPlayerName(name);
    setGameState('connecting');
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ playerName: name, team })
      });
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

  // Start room polling
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

  // Other handlers: handleAnswer, handleNextQuestion, startGame, resetGame...
  // ... (omitted for brevity, see full code in your message)
}
