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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectNative } from "@/components/ui/select-native";
import { useFetchSteamGameDetails } from "@/services/game/useGameService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, {
    message: "Please select a game to display.",
  }),
  platform: z
    .string()
    .min(1, {
      message: "Please select a platform to display.",
    })
    .default("PC"),
  iconUrl: z.string().min(1, {
    message: "Please select a game to display.",
  }),
});

export function AddGameModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchGame, setSearchGame] = useState(false);

  const { data: gameSearchResults, isLoading } = useFetchSteamGameDetails(
    form.getValues("name"),
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

  const handleSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      if (!values.name || !values.platform) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (!values.iconUrl) {
        toast.error("Please select a game.");
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
          name: values.name,
          platform: values.platform,
          lastPlayed: new Date(),
          iconUrl: values.iconUrl,
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
    },
    [form, onClose, router]
  );

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Add Game</DialogTitle>
              <DialogDescription>Add a game to your library.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder="Elden Ring"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <SelectNative
                        id="platform"
                        className="bg-transparent"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="" disabled>
                          Please select a value
                        </option>
                        <option value="PC">PC</option>
                        <option value="PS5">PS5</option>
                      </SelectNative>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game</FormLabel>
                    <div className="flex items-center gap-x-2">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="w-full"
                            disabled={
                              isLoading ||
                              (gameSearchResults &&
                                gameSearchResults.total < 1) ||
                              !form.getValues("name") ||
                              !gameSearchResults
                            }
                          >
                            <SelectValue placeholder="Select the game" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gameSearchResults &&
                            gameSearchResults.results.map((game) => (
                              <SelectItem
                                key={game.iconUrl}
                                value={game.iconUrl || ""}
                                onClick={() => form.setValue("name", game.name)}
                              >
                                {game.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        disabled={isLoading || form.getValues("name") === ""}
                        onClick={() => setSearchGame(true)}
                      >
                        {isLoading ? (
                          <Icons.Loader className="size-4 animate-spin" />
                        ) : (
                          <Icons.Search className="size-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Icons.Loader className="size-4 animate-spin mr-2" />
                )}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
