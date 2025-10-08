import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Skull, Heart, Shield, Sword } from "lucide-react";
import { useEffect, useState } from "react";

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

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface BattleArenaProps {
  players: Player[];
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (playerId: string, answerIndex: number) => void;
  onNextQuestion: () => void;
  gamePhase: 'question' | 'results' | 'ended';
  winner?: Player;
  currentPlayerId?: string | null;
}

export function BattleArena({
  players,
  currentQuestion,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNextQuestion,
  gamePhase,
  winner,
  currentPlayerId
}: BattleArenaProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const playerCharacter = players.find(p => p.id === currentPlayerId);
  const alivePlayers = players.filter(p => p.isAlive);

  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
  }, [currentQuestion?.id]);

  const handleAnswer = (answerIndex: number) => {
    if (hasAnswered || !playerCharacter?.isAlive || !currentPlayerId) return;
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    onAnswer(currentPlayerId, answerIndex);
  };

  const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTeamColor = (team: 'red' | 'blue') => {
    return team === 'red' ? 'text-red-400' : 'text-blue-400';
  };

  const getTeamBg = (team: 'red' | 'blue') => {
    return team === 'red' ? 'bg-red-900/30 border-red-600/50' : 'bg-blue-900/30 border-blue-600/50';
  };

  if (gamePhase === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-gray-900/50 border-red-600/30 backdrop-blur-lg text-center">
          <div className="mb-6">
            {winner ? (
              <>
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${getTeamBg(winner.team)}`}>
                  {winner.team === 'red' ? '⚔️' : '🛡️'}
                </div>
                <h1 className="text-4xl font-bold text-yellow-400 mb-2">🏆 VICTORY! 🏆</h1>
                <h2 className={`text-2xl font-semibold ${getTeamColor(winner.team)}`}>{winner.name} Wins!</h2>
                <p className="text-gray-300 mt-2">
                  {winner.team === 'red' ? 'Red Team Offensive Victory!' : 'Blue Team Defensive Victory!'}
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  Final Stats: {winner.health}/{winner.maxHealth} HP | {winner.shield} Shield
                </div>
              </>
            ) : (
              <>
                <Skull className="w-20 h-20 mx-auto mb-4 text-red-400" />
                <h1 className="text-4xl font-bold text-red-400 mb-2">💀 TOTAL ANNIHILATION 💀</h1>
                <p className="text-gray-300">No survivors remain</p>
              </>
            )}
          </div>
          
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8"
          >
            🔥 BATTLE AGAIN 🔥
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-gray-900/50 rounded-lg p-4 backdrop-blur-lg border border-red-600/30">
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold text-red-400">🔥 CYBERBATTLE ARENA 🔥</h1>
            <Badge variant="secondary" className="bg-red-600/20 text-red-300">
              Question {questionNumber}/{totalQuestions}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              {alivePlayers.length} fighters alive
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Red Team */}
            <Card className="p-4 bg-red-900/20 border-red-600/50 backdrop-blur-lg">
              <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <Sword className="w-5 h-5" />
                RED TEAM (Attackers)
              </h2>
              <div className="space-y-3">
                {players.filter(p => p.team === 'red').map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg transition-all ${
                      player.isAlive 
                        ? 'bg-red-800/30 border border-red-700/50' 
                        : 'bg-gray-900/50 border border-gray-800/30 opacity-60'
                    } ${player.id === currentPlayerId ? 'ring-2 ring-red-400' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                        {player.isAlive ? '⚔️' : '💀'}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${player.isAlive ? 'text-red-300' : 'text-gray-500'}`}>
                          {player.name} {player.id === currentPlayerId ? '(YOU)' : ''}
                        </h3>
                        {player.isAlive && (
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={(player.health / player.maxHealth) * 100}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-red-300">
                              {player.health}HP
                            </span>
                            {player.shield > 0 && (
                              <span className="text-xs text-blue-300">
                                🛡️{player.shield}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Blue Team */}
            <Card className="p-4 bg-blue-900/20 border-blue-600/50 backdrop-blur-lg">
              <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                BLUE TEAM (Defenders)
              </h2>
              <div className="space-y-3">
                {players.filter(p => p.team === 'blue').map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg transition-all ${
                      player.isAlive 
                        ? 'bg-blue-800/30 border border-blue-700/50' 
                        : 'bg-gray-900/50 border border-gray-800/30 opacity-60'
                    } ${player.id === currentPlayerId ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {player.isAlive ? '🛡️' : '💀'}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${player.isAlive ? 'text-blue-300' : 'text-gray-500'}`}>
                          {player.name} {player.id === currentPlayerId ? '(YOU)' : ''}
                        </h3>
                        {player.isAlive && (
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={(player.health / player.maxHealth) * 100}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-blue-300">
                              {player.health}HP
                            </span>
                            {player.shield > 0 && (
                              <span className="text-xs text-blue-300">
                                🛡️{player.shield}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Question Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gray-900/50 border-red-600/30 backdrop-blur-lg">
              {gamePhase === 'question' && currentQuestion && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      {currentQuestion.question}
                    </h2>
                    
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          disabled={hasAnswered || !playerCharacter?.isAlive}
                          variant="outline"
                          className={`w-full p-4 h-auto text-left justify-start transition-all ${
                            selectedAnswer === index
                              ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
                              : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-200'
                          } ${!playerCharacter?.isAlive ? 'opacity-50' : ''}`}
                        >
                          <span className="text-lg font-bold mr-3">
                            {option.charAt(0)}
                          </span>
                          <span className="text-base">{option.substring(3)}</span>
                        </Button>
                      ))}
                    </div>
                    
                    {!playerCharacter?.isAlive && (
                      <div className="mt-6 p-4 bg-red-900/50 border border-red-800/50 rounded-lg">
                        <p className="text-red-300 text-center font-bold">💀 YOU HAVE BEEN ELIMINATED! 💀</p>
                        <p className="text-red-200 text-center mt-2">Watch the battle continue...</p>
                      </div>
                    )}

                    {hasAnswered && (
                      <div className="mt-6 p-4 bg-green-900/50 border border-green-800/50 rounded-lg">
                        <p className="text-green-300 text-center font-bold">✅ Answer submitted! Waiting for other players...</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {gamePhase === 'results' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-red-400 mb-4">⚔️ BATTLE RESULTS ⚔️</h3>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={onNextQuestion}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8"
                    >
                      🔥 NEXT BATTLE 🔥
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}