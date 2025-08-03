"use client";

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
import { useGameContext } from "@/context/useGameContext";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

export function RemoveGameModal() {
  const [isOpen, setIsOpen] = useQueryState("remove-game-modal", parseAsBoolean.withDefault(false));
  const [isRemoving, setIsRemoving] = useState(false);
  const { gamesByMenu, gameSelected, fetchDbGames } = useGameContext();

  const currentGame = gamesByMenu[gameSelected];

  const handleRemoveGame = async () => {
    if (!currentGame) return;

    setIsRemoving(true);
    try {
      const response = await fetch("/api/games", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: currentGame.name }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove game");
      }

      toast.success(`${currentGame.name} was removed successfully!`);
      setIsOpen(false);
      
      // Refresh games data
      await fetchDbGames();
    } catch (error) {
      console.error("Error removing game:", error);
      toast.error("Error removing game");
    } finally {
      setIsRemoving(false);
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  if (!currentGame) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md ps5-card border-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white ps5-text-glow text-xl font-semibold flex items-center gap-3">
            <Icons.Trash2 className="text-red-400 size-5" />
            Remove Game
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to remove this game from your library?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          {currentGame.iconUrl && (
            <img
              src={currentGame.iconUrl}
              alt={currentGame.name}
              className="w-16 h-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{currentGame.name}</h3>
            <p className="text-gray-400 text-sm">
              {'platform' in currentGame ? currentGame.platform : 'Steam'}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={isRemoving}
            className="bg-gray-500/20 backdrop-blur-md border border-gray-400/30 hover:bg-gray-500/30 transition-all duration-300 text-gray-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveGame}
            disabled={isRemoving}
            className="bg-red-500/20 backdrop-blur-md border border-red-400/30 hover:bg-red-500/30 transition-all duration-300 text-red-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemoving ? (
              <>
                <Icons.Loader className="size-4 animate-spin mr-2" />
                Removing...
              </>
            ) : (
              <>
                <Icons.Trash2 className="size-4 mr-2" />
                Remove Game
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 