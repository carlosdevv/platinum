"use client";

import { Icons } from "@/components/icons";
import { GameCover } from "@/components/game-cover";
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
import { GameTagsField } from "@/components/game-tags-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { fetchWithSession } from "@/lib/client-auth-fetch";
import { z } from "zod";

const formSchema = z.object({
  iconUrl: z.string().url().optional().or(z.literal("")),
  imageFit: z.enum(["auto", "cover", "contain"]),
  imagePosition: z.enum(["center", "top", "bottom", "left", "right"]),
  lastPlayed: z.string().min(1, "Last played date is required"),
  platform: z.enum(["Console", "PC", "Outro"], {
    error: "Platform is required",
  }),
  status: z.enum(["not_started", "playing", "completed"]),
  tagIds: z.array(z.string()),
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
      imageFit: "auto",
      imagePosition: "center",
      lastPlayed: "",
      platform: "Console",
      status: "completed",
      tagIds: [],
    },
  });
  const previewImageUrl = useWatch({ control: form.control, name: "iconUrl" });
  const previewImageFit = useWatch({ control: form.control, name: "imageFit" });
  const previewImagePosition = useWatch({ control: form.control, name: "imagePosition" });

  useEffect(() => {
    if (currentGame) {
      const platform = 'platform' in currentGame ? currentGame.platform : "Console";
      const validPlatform = ["PC", "Console", "Outro"].includes(platform) ? platform as FormValues["platform"] : "Console";
      
      form.reset({
        iconUrl: currentGame.iconUrl || "",
        imageFit: "imageFit" in currentGame && ["auto", "cover", "contain"].includes(currentGame.imageFit) ? currentGame.imageFit as FormValues["imageFit"] : "auto",
        imagePosition: "imagePosition" in currentGame && ["center", "top", "bottom", "left", "right"].includes(currentGame.imagePosition) ? currentGame.imagePosition as FormValues["imagePosition"] : "center",
        lastPlayed: currentGame.lastPlayed ? new Date(currentGame.lastPlayed).toISOString().split('T')[0] : "",
        platform: validPlatform,
        status: currentGame.status === "not_started" || currentGame.status === "playing" ? currentGame.status : "completed",
        tagIds: currentGame.tags?.map(({ tag }) => tag.id) ?? [],
      });
    }
  }, [currentGame, form]);

  const handleUpdateGame = async (values: FormValues) => {
    if (!currentGame || !session?.user?.id) return;

    setIsUpdating(true);
    try {
      const response = await fetchWithSession("/api/games", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentGame.id,
          iconUrl: values.iconUrl,
          imageFit: values.imageFit,
          imagePosition: values.imagePosition,
          lastPlayed: values.lastPlayed,
          platform: values.platform,
          status: values.status,
          tagIds: values.tagIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update game");
      }

      toast.success(`${currentGame.name} atualizado com sucesso!`);
      setIsOpen(false);
      await fetchDbGames({ force: true });
    } catch (error) {
      console.error("Error updating game:", error);
      toast.error("Erro ao atualizar o jogo");
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
      <DialogContent variant="glass" className="max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl font-light text-white">Editar jogo</DialogTitle>
          <DialogDescription className="text-white/60">
            Ajuste a capa e os dados do jogo na sua biblioteca.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-4 mt-4 flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="relative h-32 w-[88px] shrink-0 overflow-hidden rounded-md bg-black/30">
            <GameCover
              key={previewImageUrl || "no-cover"}
              imageUrl={previewImageUrl}
              name={currentGame.name}
              fit={previewImageFit}
              position={previewImagePosition}
              sizes="88px"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{currentGame.name}</h3>
            <p className="text-gray-400 text-sm">
              {'platform' in currentGame ? currentGame.platform : 'Steam'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateGame)}>
            <div className="space-y-5 px-4 pb-4 pt-4">
            {/* Icon URL */}
            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    URL da capa
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://exemplo.com/capa.jpg"
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-white/30"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="imageFit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Enquadramento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/15 bg-[#111216] text-white">
                        <SelectItem value="auto">Automático</SelectItem>
                        <SelectItem value="contain">Imagem inteira</SelectItem>
                        <SelectItem value="cover">Preencher o card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imagePosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Posição</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/15 bg-[#111216] text-white">
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="top">Topo</SelectItem>
                        <SelectItem value="bottom">Base</SelectItem>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Last Played */}
            <FormField
              control={form.control}
              name="lastPlayed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white ps5-text-glow">
                    Data da platina
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="border-white/15 bg-white/5 text-white focus-visible:border-white/30"
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
                    Plataforma
                  </FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "PC") form.setValue("tagIds", []);
                    }} value={field.value}>
                    <FormControl>
                    <SelectTrigger className="border-white/15 bg-white/5 text-white">
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-white/15 bg-[#111216] text-white">
                      <SelectItem value="Console" className="text-white hover:bg-gray-700">
                        Console
                      </SelectItem>
                      <SelectItem value="Outro" className="text-white hover:bg-gray-700">Outro</SelectItem>
                      <SelectItem value="PC" className="text-white hover:bg-gray-700">
                        PC
                      </SelectItem>
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
                    <SelectItem value="not_started">Não iniciado</SelectItem>
                    <SelectItem value="playing">Jogando</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="tagIds" render={({ field }) => (
              <FormItem><GameTagsField platform={form.watch("platform")} value={field.value} onChange={field.onChange} /></FormItem>
            )} />

            </div>
            <DialogFooter className="flex gap-3 px-4 pb-4 pt-4">
              <Button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 font-medium text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="cursor-pointer gap-1 rounded-lg border border-white/25 bg-white/12 px-3 font-medium text-white backdrop-blur-md transition-colors hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Icons.Loader className="size-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Icons.Circle className="size-4" />
                    Salvar jogo
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
