import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Shield, Users, Zap } from "lucide-react";

interface Player {
  id: string;
  name: string;
  health: number;
  color: string;
}

interface GameLobbyProps {
  players: Player[];
  onStartGame: () => void;
}

export function GameLobby({ players, onStartGame }: GameLobbyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 bg-black/50 border-purple-500/30 backdrop-blur-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CyberBattle Arena
            </h1>
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-300 text-lg">Battle royale cybersecurity quiz</p>
          <p className="text-gray-400 mt-2">Answer malware questions correctly to survive!</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Players in Lobby</h2>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              {players.length} fighters
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{player.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Zap className="w-3 h-3" />
                      <span>{player.health} HP</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={onStartGame}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Start Battle
          </Button>
          <p className="text-gray-400 text-sm mt-2">
            Ready to test your cybersecurity knowledge?
          </p>
        </div>
      </Card>
    </div>
  );
}