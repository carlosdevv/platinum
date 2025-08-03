"use client";

import { useGameContext } from "@/context/useGameContext";
import { cn } from "@/lib/utils";
import { menuItens } from "./itens";

export function Menu() {
  const { menuSelected, setMenuSelected, gamesByMenu, setGameSelected, gameSelected } = useGameContext();

  const handlePressL1 = () => {
    if (gamesByMenu.length > 0) {
      const newSelected = gameSelected > 0 ? gameSelected - 1 : gamesByMenu.length - 1;
      setGameSelected(newSelected);
    }
  };

  const handlePressR1 = () => {
    if (gamesByMenu.length > 0) {
      const newSelected = gameSelected < gamesByMenu.length - 1 ? gameSelected + 1 : 0;
      setGameSelected(newSelected);
    }
  };

  const updateMenuSelection = (selectedId: string) => {
    setMenuSelected(selectedId);
    setGameSelected(0); // Reset game selection when changing tabs
  };

  return (
    <section className="flex items-center gap-6">
      {/* L1 Button */}
      <div 
        className="cursor-pointer flex items-center px-4 py-3 rounded-lg ps5-backdrop hover:bg-white/10 transition-all duration-300 group" 
        onClick={() => handlePressL1()}
      >
        <span className="text-white font-medium text-sm ps5-text-glow group-hover:text-blue-300 transition-colors">
          L1
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4">
        {menuItens.map((item) => (
          <div
            key={item.id}
            className={cn(
              "cursor-pointer transition-all duration-300 px-6 py-3 rounded-lg relative overflow-hidden",
              item.id === menuSelected 
                ? "ps5-backdrop border border-blue-500/30 shadow-lg" 
                : "hover:bg-white/5"
            )}
            onClick={() => updateMenuSelection(item.id)}
          >
            {item.id === menuSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg" />
            )}
            <h3 className={cn(
              "text-white transition-all duration-300 relative z-10 font-medium",
              item.id === menuSelected 
                ? "ps5-text-glow text-lg" 
                : "hover:text-gray-300 opacity-70"
            )}>
              {item.name}
            </h3>
          </div>
        ))}
      </div>

      {/* R1 Button */}
      <div 
        className="cursor-pointer flex items-center px-4 py-3 rounded-lg ps5-backdrop hover:bg-white/10 transition-all duration-300 group" 
        onClick={() => handlePressR1()}
      >
        <span className="text-white font-medium text-sm ps5-text-glow group-hover:text-blue-300 transition-colors">
          R1
        </span>
      </div>
    </section>
  );
}
