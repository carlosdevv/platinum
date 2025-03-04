"use client";

import { addGame } from "@/actions/add-game";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectNative } from "@/components/ui/select-native";
import { useFetchSteamGameDetails } from "@/services/game/useGameService";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface FormValues {
  name: string;
  platform: string;
  lastPlayed?: Date | null;
}

export function AddGameModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();

  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    platform: "",
    lastPlayed: null,
  });
  const [loading, setLoading] = useState(false);
  const [searchGame, setSearchGame] = useState(false);
  const [gameSelected, setGameSelected] = useState<string>("");

  const { data: gameSearchResults, isLoading } = useFetchSteamGameDetails(
    formValues.name,
    {
      enabled: searchGame,
      onSuccess: () => {
        setSearchGame(false);
      },
    }
  );

  const onClose = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("add-game-modal");
    router.replace(`${pathname}?${nextSearchParams}`);
    setOpen(false);
  }, [pathname, router, searchParams]);

  const handleSubmit = useCallback(async () => {
    if (!formValues.name || !formValues.platform) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const userId = data?.user.id;

      if (!userId) {
        toast.error("Please login to add a game.");
        return;
      }


      await addGame({
        name: formValues.name,
        platform: formValues.platform,
        lastPlayed: new Date(),
        iconUrl: gameSelected,
        userId,
      });

      toast.success("Game added successfully!");
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error adding game:", error);
      toast.error("Error adding game. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formValues, onClose, router]);

  useEffect(() => {
    const isOpen = searchParams.get("add-game-modal") === "true";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Game</DialogTitle>
          <DialogDescription>Add a game to your library.</DialogDescription>
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
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col w-full gap-2">
            <Label htmlFor="platform">Platform</Label>
            <SelectNative
              id="platform"
              className="bg-transparent"
              value={formValues.platform}
              onChange={(e) =>
                setFormValues({ ...formValues, platform: e.target.value })
              }
            >
              <option value="" disabled>
                Please select a value
              </option>
              <option value="PC">PC</option>
              <option value="PS5">PS5</option>
            </SelectNative>
          </div>

          <div className="flex flex-col w-full gap-2">
            <Label htmlFor="game">Game</Label>
            <div className="flex items-center gap-x-2">
              <Select onValueChange={(value) => setGameSelected(value)}>
                <SelectTrigger
                  className="w-full"
                  disabled={
                    isLoading ||
                    (gameSearchResults && gameSearchResults.total < 1)
                  }
                >
                  <SelectValue placeholder="Select the game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Games</SelectLabel>
                    {gameSearchResults?.results.map((game) => (
                      <div key={game.appid}>
                        <SelectItem
                          key={game.appid}
                          value={game.iconUrl || game.logoUrl || ""}
                        >
                          {game.name}
                        </SelectItem>
                      </div>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isLoading || formValues.name === ""}
                onClick={() => setSearchGame(true)}
              >
                {isLoading ? (
                  <Icons.Loader className="size-4 animate-spin" />
                ) : (
                  <Icons.Search className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Icons.Loader className="size-4 animate-spin mr-2" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
