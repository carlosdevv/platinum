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
import { useGameContext } from "@/context/useGameContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchSteamGameDetails } from "@/services/game/useGameService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Game name is required"),
  platform: z.enum(["PS5", "PC"], {
    required_error: "Platform is required",
  }),
  iconUrl: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGameModal() {
  const [isOpen, setIsOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchDbGames } = useGameContext();
  const { data: session } = useSession();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: steamSearchResults, isLoading: isSearching } = useFetchSteamGameDetails(
    debouncedSearchTerm,
    { enabled: debouncedSearchTerm.length >= 3 }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: "PS5",
      iconUrl: "",
    },
  });

  const handleGameSelect = (game: any) => {
    form.setValue("name", game.name);
    form.setValue("iconUrl", game.iconUrl || "");
    setSearchTerm(game.name);
  };

  const onSubmit = async (values: FormValues) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to add a game");
      return;
    }

    setIsSubmitting(true);
    try {
      await addGame({
        name: values.name,
        platform: values.platform,
        lastPlayed: new Date(),
        iconUrl: values.iconUrl || "",
        hasPlatinum: true,
        userId: session.user.id,
      });

      toast.success("Game added successfully!");
      form.reset();
      setSearchTerm("");
      setIsOpen(false);
      await fetchDbGames();
    } catch (error) {
      console.error("Error adding game:", error);
      toast.error("Error adding game");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md ps5-card border-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white ps5-text-glow text-xl font-semibold flex items-center gap-3">
            <Icons.Plus className="text-green-400 size-5" />
            Add New Game
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Add a new game to your platinum collection.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Game Name with Search */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    Game Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          field.onChange(e);
                        }}
                        placeholder="Search for a game..."
                        className="ps5-card border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Icons.Loader className="size-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  
                  {/* Steam Search Results */}
                  {steamSearchResults?.results && steamSearchResults.results.length > 0 && searchTerm.length >= 3 && (
                    <div className="mt-2 max-h-40 overflow-y-auto bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-600">
                      {steamSearchResults.results.slice(0, 5).map((game: any, index: number) => (
                        <button
                          key={`${game.appid}-${index}`}
                          type="button"
                          onClick={() => handleGameSelect(game)}
                          className="w-full p-3 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-600 last:border-b-0 flex items-center gap-3"
                        >
                          {game.iconUrl && (
                            <img
                              src={game.iconUrl}
                              alt={game.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{game.name}</div>
                            <div className="text-gray-400 text-xs">Steam</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
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

            {/* Icon URL */}
            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    Icon URL (Optional)
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

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-gray-500/20 backdrop-blur-md border border-gray-400/30 hover:bg-gray-500/30 transition-all duration-300 text-gray-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-300 text-blue-300 font-medium px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Icons.Loader className="size-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Icons.Plus className="size-4 mr-2" />
                    Add Game
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
