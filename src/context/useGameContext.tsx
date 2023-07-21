"use client";
import { GameDataResponse } from "@/app/(services)/game/types";
import { MenuOptions } from "@/lib/types";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type GameContextType = {
  gameSelected: number;
  setGameSelected: React.Dispatch<React.SetStateAction<number>>;
  gameList: GameDataResponse[];
  setGameList: React.Dispatch<React.SetStateAction<GameDataResponse[]>>;
  platinumGamesList: GameDataResponse[];
  menuSelected: number;
  setMenuSelected: React.Dispatch<React.SetStateAction<number>>;
  setPlatinumGamesList: React.Dispatch<
    React.SetStateAction<GameDataResponse[]>
  >;
  handlePressR1: () => void;
  handlePressL1: () => void;
};

type GameProviderProps = {
  children: ReactNode;
};

export const GameContext = createContext<GameContextType>(
  {} as GameContextType
);

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameSelected, setGameSelected] = useState<number>(0);
  const [menuSelected, setMenuSelected] = useState<number>(1);
  const [gameList, setGameList] = useState<GameDataResponse[]>([]);
  const [platinumGamesList, setPlatinumGamesList] = useState<
    GameDataResponse[]
  >([]);

  const setCurrentList = useCallback(() => {
    const optionLists = {
      [Number(MenuOptions.RECENT_PLAYED)]: gameList,
      [Number(MenuOptions.PLATINUM)]: platinumGamesList,
    };

    return optionLists[menuSelected];
  }, [gameList, menuSelected, platinumGamesList]);

  const handlePressR1 = useCallback(() => {
    const currentList = setCurrentList();
    if (gameSelected < currentList.length - 1) {
      setGameSelected((prevState) => prevState + 1);
    }
  }, [gameSelected, setCurrentList]);

  const handlePressL1 = useCallback(() => {
    if (gameSelected > 0) {
      setGameSelected((prevState) => prevState - 1);
    }
  }, [gameSelected]);

  return (
    <GameContext.Provider
      value={{
        gameSelected,
        setGameSelected,
        gameList,
        setGameList,
        platinumGamesList,
        menuSelected,
        setMenuSelected,
        setPlatinumGamesList,
        handlePressR1,
        handlePressL1,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);

  return context;
};
