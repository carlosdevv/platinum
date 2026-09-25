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
import { fetchWithSession } from "@/lib/client-auth-fetch";

export function RemoveGameModal() {
  const [isOpen, setIsOpen] = useQueryState("remove-game-modal", parseAsBoolean.withDefault(false));
  const [isRemoving, setIsRemoving] = useState(false);
  const { gamesByMenu, gameSelected, fetchDbGames } = useGameContext();

  const currentGame = gamesByMenu[gameSelected];

  const handleRemoveGame = async () => {
    if (!currentGame) return;

    setIsRemoving(true);
    try {
      const response = await fetchWithSession("/api/games", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: currentGame.id }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível excluir o jogo.");
      }

      toast.success(`${currentGame.name} foi excluído da biblioteca.`);
      setIsOpen(false);
      
      // Refresh games data
      await fetchDbGames({ force: true });
    } catch (error) {
      console.error("Error removing game:", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o jogo.");
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
      <DialogContent variant="glass" className="max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl font-light text-white">Excluir jogo</DialogTitle>
          <DialogDescription className="text-white/60">
            Quer mesmo remover este jogo da sua biblioteca?
          </DialogDescription>
        </DialogHeader>

        <div className="mx-4 mt-4 flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
          {currentGame.iconUrl && (
            <img
              src={currentGame.iconUrl}
              alt={currentGame.name}
              className="size-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{currentGame.name}</h3>
            <p className="text-gray-400 text-sm">
              {'platform' in currentGame ? currentGame.platform : 'Steam'}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3 px-4 pb-4 pt-4">
          <Button
            onClick={onClose}
            disabled={isRemoving}
            className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 text-white/70 backdrop-blur-md hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRemoveGame}
            disabled={isRemoving}
            className="cursor-pointer gap-1 rounded-lg border border-red-300/20 bg-red-400/10 px-3 text-red-100 backdrop-blur-md hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRemoving ? (
              <>
                <Icons.Loader className="size-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Icons.Trash2 className="size-4" />
                Excluir jogo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
