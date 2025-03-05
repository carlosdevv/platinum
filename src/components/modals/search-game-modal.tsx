"use client";

import { removeGame } from "@/actions/remove-game";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameContext } from "@/context/useGameContext";
import type { FetchPsnGamesResponse } from "@/services/game/types";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function SearchGameModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { platinumGames, dbGames } = useGameContext();
  const { data } = useSession();

  const [open, setOpen] = useState(false);
  const [isFoundGame, setIsFoundGame] = useState<
    FetchPsnGamesResponse | undefined | null
  >();
  const [isRemovingGame, setIsRemovingGame] = useState(false);

  const handleRemoveGame = async (gameName: string) => {
    const userId = data?.user.id;

    if (!userId) {
      toast.error("Please login to remove a game.");
      return;
    }

    setIsRemovingGame(true);

    try {
      await removeGame({ name: gameName, userId });
      toast.success("Game removed successfully.");
      onClose();
    } catch (error) {
      toast.error("Failed to remove game.");
    } finally {
      setIsRemovingGame(false);
    }
  };

  const handleSearchGame = (gameName: string) => {
    if (gameName === "") {
      setIsFoundGame(undefined);
      return;
    }

    const game = platinumGames.find((game) =>
      game.name.toLowerCase().includes(gameName.toLowerCase())
    );

    if (!game) {
      setIsFoundGame(null);
      return;
    }

    setIsFoundGame(game);
  };

  const onClose = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("search-game-modal");
    router.replace(`${pathname}?${nextSearchParams}`);
    setOpen(false);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const isOpen = searchParams.get("search-game-modal") === "true";

    if (isOpen) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchParams]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Game</DialogTitle>
          <DialogDescription>Search a game of your library.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="name" className="line-clamp-1">
              Game Name
            </Label>
            <Input
              id="name"
              placeholder="Elden Ring"
              className="w-full"
              onChange={(e) => handleSearchGame(e.target.value)}
            />
          </div>

          {isFoundGame ? (
            <div className="flex flex-col gap-y-6">
              <div className="flex w-full justify-between items-center text-sm">
                <Image
                  src={isFoundGame.iconUrl}
                  alt={isFoundGame.name}
                  width={100}
                  height={100}
                  className="rounded-md size-14"
                />
                <span className="text-gray-500 truncate max-w-44">
                  {isFoundGame.name}
                </span>
                <span className="text-xs text-background w-8 text-center font-semibold bg-white rounded">
                  {isFoundGame.platform.includes("Steam") ||
                  isFoundGame.platform === "PC"
                    ? "PC"
                    : "PS5"}
                </span>
                <span className="text-gray-500">
                  {format(isFoundGame.lastPlayed, "dd/MM/yyyy")}
                </span>
                {dbGames.some((game) => game.name === isFoundGame.name) &&
                  (isRemovingGame ? (
                    <Icons.Loader className="size-4 animate-spin" />
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveGame(isFoundGame.name)}
                    >
                      <Icons.Remove className="text-rose-500 size-4" />
                    </Button>
                  ))}
              </div>
              <div className="flex items-center gap-x-2">
                <Label htmlFor="name" className="line-clamp-1">
                  This game is already in your library.
                </Label>
                <Icons.CheckCircle className="text-emerald-500 size-4" />
              </div>
            </div>
          ) : (
            isFoundGame === null && (
              <div className="flex items-center gap-x-2">
                <Label htmlFor="name" className="line-clamp-1">
                  This game is not in your library.
                </Label>
                <Icons.XCircle className="text-rose-500 size-4" />
              </div>
            )
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} disabled={isRemovingGame}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
