"use client";

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
import { SelectNative } from "@/components/ui/select-native";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
export function AddGameModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("add-game-modal");
    router.replace(`${pathname}?${nextSearchParams}`);
    setOpen(false);
  }, [pathname, router, searchParams]);

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
            <Input id="name" placeholder="Elden Ring" className="w-full" />
          </div>
          <div className="flex w-full items-center gap-4">
            <Label htmlFor="username">Platform</Label>
            <SelectNative id="platform" className="bg-transparent">
              <option value="" disabled>
                Please select a value
              </option>
              <option value="PC">PC</option>
              <option value="PS5">PS5</option>
            </SelectNative>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
