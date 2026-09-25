import type { GameFilter } from "@/context/useGameContext";

export type MenuItensProps = {
  id: GameFilter;
  name: string;
  tooltip: string;
};

export const menuItens: MenuItensProps[] = [
  {
    id: "platinados",
    name: "Platinados",
    tooltip: "Mostrar jogos platinados",
  },
  {
    id: "todos",
    name: "Todos",
    tooltip: "Mostrar todos os jogos já jogados",
  },
  {
    id: "console",
    name: "Console",
    tooltip: "Mostrar jogos do console",
  },
  {
    id: "outro",
    name: "Outro",
    tooltip: "Mostrar jogos de outras plataformas",
  },
  {
    id: "pc",
    name: "PC",
    tooltip: "Mostrar jogos do PC",
  },
];
