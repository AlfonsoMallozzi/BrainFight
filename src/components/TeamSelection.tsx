import { Button } from "./ui/button";
import { Card } from "./ui/card";

export type Team = 'red' | 'blue';

interface TeamSelectionProps {
  onTeamSelect: (team: Team) => void;
}

export function TeamSelection({ onTeamSelect }: TeamSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            🔥 CYBERSECURITY ARENA 🔥
          </h1>
          <p className="text-xl text-gray-300">
            Choose Your Fighting Style
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Red Team Option */}
          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-600/50 p-8 hover:border-red-500 transition-all duration-300 group cursor-pointer"
                onClick={() => onTeamSelect('red')}>
            <div className="text-center space-y-6">
              <div className="text-6xl">⚔️</div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-red-400">
                  1 - RED TEAMER
                </h2>
                <div className="text-red-300 space-y-2">
                  <p className="text-lg font-semibold">OFFENSIVE SPECIALIST</p>
                  <p>💥 Deal +10 damage per attack</p>
                  <p>🎯 Exploit vulnerabilities</p>
                  <p>🔥 Aggressive tactics</p>
                </div>
              </div>
              <Button 
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 group-hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onTeamSelect('red');
                }}
              >
                SELECT RED TEAM
              </Button>
            </div>
          </Card>

          {/* Blue Team Option */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/50 p-8 hover:border-blue-500 transition-all duration-300 group cursor-pointer"
                onClick={() => onTeamSelect('blue')}>
            <div className="text-center space-y-6">
              <div className="text-6xl">🛡️</div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-blue-400">
                  2 - BLUE TEAMER
                </h2>
                <div className="text-blue-300 space-y-2">
                  <p className="text-lg font-semibold">DEFENSIVE SPECIALIST</p>
                  <p>🛡️ Gain +11 shield per round</p>
                  <p>🔒 Strengthen defenses</p>
                  <p>⚡ Protective strategies</p>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 group-hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onTeamSelect('blue');
                }}
              >
                SELECT BLUE TEAM
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}