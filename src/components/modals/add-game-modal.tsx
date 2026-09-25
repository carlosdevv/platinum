"use client";

import { addGame } from "@/actions/add-game";
import { syncSteamAchievementBatch } from "@/actions/sync-steam-games";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGameContext } from "@/context/useGameContext";
import { GameTagsField } from "@/components/game-tags-field";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchSteamGameDetails } from "@/services/game/useGameService";
import type { SteamGameDetailsResponse } from "@/services/game/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Informe o nome do jogo."),
  platform: z.enum(["Console", "PC", "Outro"], { error: "Selecione a plataforma." }),
  status: z.enum(["not_started", "playing", "completed"]),
  hasPlatinum: z.boolean(),
  tagIds: z.array(z.string()),
  iconUrl: z.string().url("Informe uma URL válida.").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGameModal() {
  const [isOpen, setIsOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [trackAchievements, setTrackAchievements] = useState(true);
  const { fetchDbGames, steamConnection } = useGameContext();
  const { data: session } = useSession();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: steamSearchResults, isLoading: isSearching } = useFetchSteamGameDetails(
    debouncedSearchTerm,
    { enabled: debouncedSearchTerm.length >= 3 },
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", platform: "Console", status: "completed", hasPlatinum: true, tagIds: [], iconUrl: "" },
  });
  const shouldTrackSteam = Boolean(steamConnection && selectedAppId && form.watch("platform") === "PC" && trackAchievements);

  const handleGameSelect = (game: SteamGameDetailsResponse["results"][number]) => {
    form.setValue("name", game.name, { shouldValidate: true });
    form.setValue("iconUrl", game.iconUrl || "");
    setSearchTerm(game.name);
    setSelectedAppId(String(game.appId));
    setTrackAchievements(true);
  };

  const resetForm = () => {
    form.reset();
    setSearchTerm("");
    setSelectedAppId(null);
    setTrackAchievements(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (!session?.user?.id) {
      toast.error("Entre na sua conta para adicionar um jogo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const game = await addGame({
        name: values.name,
        platform: values.platform,
        lastPlayed: values.status === "completed" && !shouldTrackSteam ? new Date() : undefined,
        iconUrl: values.iconUrl || "",
        hasPlatinum: !shouldTrackSteam && values.hasPlatinum,
        status: shouldTrackSteam ? "playing" : values.status,
        tagIds: values.tagIds,
        ...(selectedAppId ? { externalGameId: selectedAppId } : {}),
        trackAchievements: shouldTrackSteam,
      });

      if (shouldTrackSteam) {
        try {
          await syncSteamAchievementBatch([game.id]);
        } catch (error) {
          console.warn("Could not fetch achievements for manually linked Steam game", error);
        }
      }

      toast.success(shouldTrackSteam ? "Jogo adicionado. Buscando conquistas na Steam." : "Jogo adicionado à sua biblioteca.");
      resetForm();
      setIsOpen(false);
      await fetchDbGames({ force: true });
    } catch (error) {
      console.error("Error adding game:", error);
      toast.error(error instanceof Error ? error.message : "Não foi possível adicionar o jogo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
      <DialogContent variant="glass" className="max-w-lg">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl font-light text-white">Adicionar jogo</DialogTitle>
          <DialogDescription className="text-white/60">
            Pesquise no catálogo da Steam ou cadastre um jogo manualmente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-5 px-4 pb-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white ps5-text-glow">Nome do jogo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          value={searchTerm}
                          onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setSelectedAppId(null);
                            field.onChange(event);
                          }}
                          placeholder="Digite pelo menos 3 letras para buscar no catálogo"
                          className="border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-white/30"
                        />
                        {isSearching && <Icons.Loader className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />}
                      </div>
                    </FormControl>
                    {debouncedSearchTerm.length >= 3 && (
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm">
                        {steamSearchResults?.results?.length ? steamSearchResults.results.slice(0, 5).map((game) => (
                          <button
                            key={game.appId}
                            type="button"
                            onClick={() => handleGameSelect(game)}
                            className="flex w-full cursor-pointer items-center gap-3 border-b border-white/10 p-3 text-left transition-colors last:border-0 hover:bg-white/10"
                          >
                            {game.iconUrl && <Image src={game.iconUrl} alt="" width={32} height={48} className="h-12 w-8 rounded object-cover" />}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-white">{game.name}</span>
                              <span className="block text-xs text-white/45">Catálogo da Steam · AppID {game.appId}</span>
                            </span>
                            {selectedAppId === String(game.appId) && <span className="text-xs text-sky-300">Selecionado</span>}
                          </button>
                        )) : !isSearching ? <p className="p-3 text-sm text-white/50">Nenhum jogo encontrado no catálogo.</p> : null}
                      </div>
                    )}
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {selectedAppId && form.watch("platform") === "PC" && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  {steamConnection ? (
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={trackAchievements}
                        onChange={(event) => setTrackAchievements(event.target.checked)}
                        className="mt-1 accent-sky-400"
                      />
                      <span>
                        <span className="block font-medium text-white">Importar conquistas da Steam</span>
                        <span className="mt-1 block text-xs leading-5 text-white/55">
                          Também serve para jogos da Família Steam. A Steam precisa disponibilizar as conquistas desse jogo publicamente.
                        </span>
                      </span>
                    </label>
                  ) : (
                    <p className="text-xs leading-5 text-white/60">
                      Este jogo veio do catálogo da Steam. Conecte sua conta Steam para tentar importar as conquistas; sem conexão, ele será salvo como concluído manualmente.
                    </p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white ps5-text-glow">Plataforma</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "PC") form.setValue("tagIds", []);
                    }} value={field.value}>
                      <FormControl><SelectTrigger className="border-white/15 bg-white/5 text-white"><SelectValue placeholder="Selecione uma plataforma" /></SelectTrigger></FormControl>
                      <SelectContent className="border-white/15 bg-[#111216] text-white">
                        <SelectItem value="Console" className="text-white hover:bg-gray-700">Console</SelectItem>
                        <SelectItem value="PC" className="text-white hover:bg-gray-700">PC</SelectItem>
                        <SelectItem value="Outro" className="text-white hover:bg-gray-700">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="border-white/15 bg-white/5 text-white"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="border-white/15 bg-[#111216] text-white">
                      <SelectItem value="not_started" className="text-white">Não iniciado</SelectItem>
                      <SelectItem value="playing" className="text-white">Jogando</SelectItem>
                      <SelectItem value="completed" className="text-white">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              {!shouldTrackSteam && <FormField control={form.control} name="hasPlatinum" render={({ field }) => (
                <FormItem>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="mt-1 accent-sky-400" />
                    <span><span className="block font-medium text-white">Jogo platinado</span><span className="mt-1 block text-xs text-white/50">Marque se você já conquistou a platina ou concluiu todas as conquistas.</span></span>
                  </label>
                </FormItem>
              )} />}
              <FormField control={form.control} name="tagIds" render={({ field }) => (
                <FormItem><GameTagsField platform={form.watch("platform")} value={field.value} onChange={field.onChange} /></FormItem>
              )} />

              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white ps5-text-glow">URL da capa (opcional)</FormLabel>
                    <FormControl><Input {...field} placeholder="https://exemplo.com/capa.jpg" className="border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-white/30" /></FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4 flex gap-3 px-4 pb-4 pt-4">
              <Button type="button" onClick={handleClose} disabled={isSubmitting} className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 font-medium text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer gap-1 rounded-lg border border-white/25 bg-white/12 px-3 font-medium text-white backdrop-blur-md transition-colors hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? <><Icons.Loader className="size-4 animate-spin" />Adicionando...</> : <><Icons.Plus className="size-4" />Adicionar jogo</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
