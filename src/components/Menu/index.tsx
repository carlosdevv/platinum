"use client";

import { useGameContext } from "@/context/useGameContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MenuItensProps, menuItens } from "./itens";

export function Menu() {
  const { setGameSelected, handlePressR1, handlePressL1, setMenuSelected } =
    useGameContext();
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
            `${
              item.isSelected && "py-3 px-9 bg-white bg-opacity-5 rounded-full"
            }`
          )}
        >
          <h3 className="text-white">{item.name}</h3>
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
