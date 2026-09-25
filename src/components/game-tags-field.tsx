"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchWithSession } from "@/lib/client-auth-fetch";

type GameTag = { id: string; name: string; color: string; _count?: { games: number } };
const DEFAULT_TAG_COLOR = "#3B82F6";
const isHexColor = (color: string) => /^#[\da-fA-F]{6}$/.test(color);

export function GameTagsField({ value, onChange, platform }: {
  value: string[];
  onChange: (tagIds: string[]) => void;
  platform: string;
}) {
  const [tags, setTags] = useState<GameTag[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_TAG_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState(DEFAULT_TAG_COLOR);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithSession("/api/game-tags");
      if (!response.ok) throw new Error("Não foi possível carregar suas tags.");
      const data = await response.json() as { tags: GameTag[] };
      setTags(data.tags);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar suas tags.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTags(); }, [loadTags]);

  if (platform === "PC") return null;

  const createTag = async () => {
    const name = newName.trim();
    if (!name) return;
    if (!isHexColor(newColor)) { toast.error("Informe uma cor hexadecimal válida, como #3B82F6."); return; }
    try {
      const response = await fetchWithSession("/api/game-tags", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color: newColor }),
      });
      const payload = await response.json() as { tag?: GameTag; message?: string };
      if (!response.ok || !payload.tag) throw new Error(payload.message ?? "Não foi possível criar a tag.");
      setTags((current) => [...current, payload.tag!].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      void queryClient.invalidateQueries({ queryKey: ["game-tags"] });
      onChange([...value, payload.tag.id]);
      setNewName("");
      setNewColor(DEFAULT_TAG_COLOR);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a tag.");
    }
  };

  const saveTag = async (tag: GameTag) => {
    const name = editingName.trim();
    if (!name || name.length > 32) { toast.error("A tag deve ter entre 1 e 32 caracteres."); return; }
    if (!isHexColor(editingColor)) { toast.error("Informe uma cor hexadecimal válida, como #3B82F6."); return; }
    if (name === tag.name && editingColor === tag.color) { setEditingId(null); return; }
    try {
      const response = await fetchWithSession("/api/game-tags", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: tag.id, name, color: editingColor }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Não foi possível renomear a tag.");
      setTags((current) => current.map((item) => item.id === tag.id ? { ...item, name, color: editingColor } : item).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
      void queryClient.invalidateQueries({ queryKey: ["game-tags"] });
      void queryClient.invalidateQueries({ queryKey: ["games"] });
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível renomear a tag.");
    }
  };

  const deleteTag = async (tag: GameTag) => {
    if (!window.confirm(`Excluir a tag “${tag.name}”? Ela será removida dos jogos associados.`)) return;
    try {
      const response = await fetchWithSession("/api/game-tags", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: tag.id }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Não foi possível excluir a tag.");
      setTags((current) => current.filter((item) => item.id !== tag.id));
      void queryClient.invalidateQueries({ queryKey: ["game-tags"] });
      void queryClient.invalidateQueries({ queryKey: ["games"] });
      onChange(value.filter((id) => id !== tag.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a tag.");
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-white">Tags <span className="font-normal text-white/45">(opcional)</span></p>
        <p className="mt-1 text-xs leading-5 text-white/50">Organize consoles e outras plataformas com marcadores seus.</p>
      </div>
      {isLoading ? <p className="text-xs text-white/45">Carregando tags…</p> : tags.length ? (
        <div className="space-y-1.5">
          {tags.map((tag) => (
            <div key={tag.id} className="flex min-h-9 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.035] px-2">
              {editingId === tag.id ? (
                <div className="flex w-full flex-wrap items-center gap-2 py-1.5">
                  <Input autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} className="h-8 min-w-28 flex-1 border-white/10 bg-black/20 px-2 text-xs text-white" />
                  <input type="color" aria-label="Selecionar cor da tag" value={isHexColor(editingColor) ? editingColor : DEFAULT_TAG_COLOR} onChange={(event) => setEditingColor(event.target.value.toUpperCase())} className="size-8 cursor-pointer rounded-md border border-white/15 bg-transparent p-0.5" />
                  <Input aria-label="Cor hexadecimal da tag" value={editingColor} maxLength={7} onChange={(event) => setEditingColor(event.target.value.toUpperCase())} className="h-8 w-24 border-white/10 bg-black/20 px-2 font-mono text-xs text-white" />
                  <button type="button" aria-label="Salvar tag" onClick={() => void saveTag(tag)} className="cursor-pointer text-emerald-300 hover:text-emerald-200"><Check className="size-4" /></button>
                  <button type="button" aria-label="Cancelar edição da tag" onClick={() => setEditingId(null)} className="cursor-pointer text-white/45 hover:text-white"><X className="size-4" /></button>
                </div>
              ) : (
                <>
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 text-sm text-white/80">
                    <input type="checkbox" checked={value.includes(tag.id)} onChange={(event) => onChange(event.target.checked ? [...value, tag.id] : value.filter((id) => id !== tag.id))} className="accent-sky-400" />
                    <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full ring-1 ring-white/20" style={{ backgroundColor: tag.color }} />
                    <span className="truncate">{tag.name}</span>
                    <span className="text-[10px] text-white/30">{tag._count?.games ?? 0}</span>
                  </label>
                  <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`Editar tag ${tag.name}`} onClick={() => { setEditingId(tag.id); setEditingName(tag.name); setEditingColor(tag.color); }} className="cursor-pointer p-1 text-white/35 hover:text-white"><Pencil className="size-3.5" /></button></TooltipTrigger><TooltipContent>Editar nome e cor da tag</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`Excluir tag ${tag.name}`} onClick={() => void deleteTag(tag)} className="cursor-pointer p-1 text-white/35 hover:text-red-300"><Trash2 className="size-3.5" /></button></TooltipTrigger><TooltipContent>Excluir tag e removê-la dos jogos</TooltipContent></Tooltip>
                </>
              )}
            </div>
          ))}
        </div>
      ) : <p className="text-xs text-white/45">Você ainda não criou tags.</p>}
      <div className="flex gap-2">
        <Input value={newName} maxLength={32} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void createTag(); } }} placeholder="Nova tag (ex.: PlayStation)" className="h-9 border-white/15 bg-white/5 text-sm text-white placeholder:text-white/35" />
        <Button type="button" variant="outline" disabled={!newName.trim()} onClick={() => void createTag()} className="h-9 shrink-0 cursor-pointer border-white/15 bg-white/5 px-3 text-white hover:bg-white/10 disabled:cursor-not-allowed"><Plus className="size-4" /><span className="sr-only">Criar tag</span></Button>
      </div>
      <div className="flex items-center gap-2">
        <input type="color" aria-label="Selecionar cor da nova tag" value={isHexColor(newColor) ? newColor : DEFAULT_TAG_COLOR} onChange={(event) => setNewColor(event.target.value.toUpperCase())} className="size-9 cursor-pointer rounded-md border border-white/15 bg-transparent p-1" />
        <Input aria-label="Cor hexadecimal da nova tag" value={newColor} maxLength={7} onChange={(event) => setNewColor(event.target.value.toUpperCase())} className="h-9 w-32 border-white/15 bg-white/5 font-mono text-sm text-white" />
        <span className="text-xs text-white/40">Cor da tag</span>
      </div>
    </div>
  );
}
