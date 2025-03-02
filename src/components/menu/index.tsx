"use client";

import { MenuItensProps, menuItens } from "@/components/menu/itens";
import { useGameContext } from "@/context/useGameContext";
import { useKeyPress } from "@/hooks/useKeyPress";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Menu() {
  const {
    setGameSelected,
    setMenuSelected,
    handlePressL1,
    handlePressR1,
    handleShowListOption,
  } = useGameContext();

  const [itens, setItens] = useState<MenuItensProps[]>(menuItens);

  function handleSelectMenuItem(id: number) {
    const newItens = itens.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isSelected: true,
        };
      }
      return {
        ...item,
        isSelected: false,
      };
    });

    setItens(newItens);
    setMenuSelected(id);
    setGameSelected(0);
  }

  const pressL1 = useKeyPress("q"); // Simulando o botão L1
  const pressR1 = useKeyPress("e"); // Simulando o botão R1

  const games = handleShowListOption();

  useEffect(() => {
    if (pressL1) {
      setGameSelected((prev) => (prev > 0 ? prev - 1 : games.length - 1));
    }

    if (pressR1) {
      setGameSelected((prev) => (prev < games.length - 1 ? prev + 1 : 0));
    }
  }, [pressL1, pressR1, games.length, setGameSelected]);

  return (
    <section className="flex items-center gap-12">
      <div
        className="cursor-pointer flex items-center p-1 rounded-r-sm rounded-ss-lg rounded-es-sm bg-opacity-40 bg-gray-400"
        onClick={() => handlePressL1()}
      >
        <span className="text-white font-medium text-xs">L1</span>
      </div>
      {itens.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSelectMenuItem(item.id)}
          className={cn(
            "cursor-pointer",
            `${item.isSelected && "py-3 bg-white bg-opacity-5 rounded-full"}`
          )}
        >
          <h3 className={cn("text-white", item.isSelected && "font-semibold")}>
            {item.name}
          </h3>
        </div>
      ))}
      <div
        className="cursor-pointer flex items-center p-1 rounded-l-sm rounded-se-lg rounded-ee-sm bg-opacity-40 bg-gray-400"
        onClick={() => handlePressR1()}
      >
        <span className="text-white font-medium text-xs">R1</span>
      </div>
    </section>
  );
}
