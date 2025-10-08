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
      // Join/create room
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          playerName: name,
          team: team
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
      
      // Start polling for room updates
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
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
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
            // Find winner
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

    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  // Handle answer submission
  const handleAnswer = async (playerId: string, answerIndex: number) => {
    if (!roomId || !room) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          playerId,
          answerIndex
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      if (data.allAnswered) {
        setGamePhase('results');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/next`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        setGamePhase('question');
      }
    } catch (error) {
      console.error('Error moving to next question:', error);
    }
  };

  // Start game
  const startGame = async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-83bde5a9/rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        setGameState('battle');
        setGamePhase('question');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // Reset game
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

  if (gameState === 'team-select') {
    return (
      <div>
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
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-8">🔥 BATTLE ARENA 🔥</h1>
          <div className="bg-gray-900/50 rounded-lg p-8 border border-red-600/30">
            <h2 className="text-2xl font-bold text-white mb-6">Waiting for Players...</h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-300">Room ID: <span className="font-mono text-red-400">{roomId?.slice(0, 8)}</span></p>
              <p className="text-gray-300">Players: {players.length}/100</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-600/50">
                  <h3 className="font-bold text-red-400 mb-2">🔥 RED TEAM</h3>
                  {players.filter(p => p.team === 'red').map(p => (
                    <div key={p.id} className="text-red-200">{p.name}</div>
                  ))}
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600/50">
                  <h3 className="font-bold text-blue-400 mb-2">🛡️ BLUE TEAM</h3>
                  {players.filter(p => p.team === 'blue').map(p => (
                    <div key={p.id} className="text-blue-200">{p.name}</div>
                  ))}
                </div>
              </div>
            </div>
            
            {players.length >= 2 && (
              <button 
                onClick={startGame}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                START BATTLE!
              </button>
            )}
            
            {players.length < 2 && (
              <p className="text-gray-400">Need at least 2 players to start...</p>
            )}
          </div>
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
          <h1 className="text-4xl font-bold text-red-400 mb-8">🔥 BATTLE ENDED! 🔥</h1>
          <div className="bg-gray-900/50 rounded-lg p-8 border border-red-600/30">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              🏆 {winner?.name} WINS! 🏆
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Final Health: {winner?.health}/{winner?.maxHealth} HP
            </p>
            
            <button 
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
