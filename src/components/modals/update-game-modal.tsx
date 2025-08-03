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
import { useGameContext } from "@/context/useGameContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  iconUrl: z.string().url().optional().or(z.literal("")),
  lastPlayed: z.string().min(1, "Last played date is required"),
  platform: z.enum(["PS5", "PC"], {
    required_error: "Platform is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function UpdateGameModal() {
  const [isOpen, setIsOpen] = useQueryState("update-game-modal", parseAsBoolean.withDefault(false));
  const [isUpdating, setIsUpdating] = useState(false);
  const { gamesByMenu, gameSelected, fetchDbGames } = useGameContext();
  const { data: session } = useSession();

  const currentGame = gamesByMenu[gameSelected];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      iconUrl: "",
      lastPlayed: "",
      platform: "PS5",
    },
  });

  useEffect(() => {
    if (currentGame) {
      const platform = 'platform' in currentGame ? currentGame.platform : "PS5";
      const validPlatform = platform === "PC" || platform === "PS5" ? platform : "PS5";
      
      form.reset({
        iconUrl: currentGame.iconUrl || "",
        lastPlayed: currentGame.lastPlayed ? new Date(currentGame.lastPlayed).toISOString().split('T')[0] : "",
        platform: validPlatform,
      });
    }
  }, [currentGame, form]);

  const handleUpdateGame = async (values: FormValues) => {
    if (!currentGame || !session?.user?.id) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/games", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentGame.name,
          iconUrl: values.iconUrl,
          lastPlayed: values.lastPlayed,
          platform: values.platform,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update game");
      }

      toast.success(`${currentGame.name} was updated successfully!`);
      setIsOpen(false);
      await fetchDbGames();
    } catch (error) {
      console.error("Error updating game:", error);
      toast.error("Error updating game");
    } finally {
      setIsUpdating(false);
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  if (!currentGame || !('id' in currentGame)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md ps5-card border-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white ps5-text-glow text-xl font-semibold flex items-center gap-3">
            <Icons.Circle className="text-blue-400 size-5" />
            Update Game
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Update the game information in your library.
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateGame)} className="space-y-6">
            {/* Icon URL */}
            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    Icon URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/game-icon.jpg"
                      className="ps5-card border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Last Played */}
            <FormField
              control={form.control}
              name="lastPlayed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    Platinum Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="ps5-card border-gray-600 text-white focus:border-blue-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Platform */}
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    Platform
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="ps5-card border-gray-600 text-white">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="ps5-card border-gray-600">
                      <SelectItem value="PS5" className="text-white hover:bg-gray-700">
                        PlayStation 5
                      </SelectItem>
                      <SelectItem value="PC" className="text-white hover:bg-gray-700">
                        PC
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="bg-gray-500/20 backdrop-blur-md border border-gray-400/30 hover:bg-gray-500/30 transition-all duration-300 text-gray-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-300 text-blue-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Icons.Loader className="size-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Icons.Circle className="size-4 mr-2" />
                    Update Game
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 