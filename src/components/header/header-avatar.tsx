"use client";

import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export function HeaderAvatar() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";

  return (
    <>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 group">
            <Avatar className="cursor-pointer ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
              {!isLoading && session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-gray-700/50 backdrop-blur-sm">
                  <Skeleton className="size-10 flex items-center justify-center rounded-full">
                    {session?.user?.name?.[0]?.toUpperCase()}
                  </Skeleton>
                </AvatarFallback>
              )}
            </Avatar>
            {!isLoading && (
              <div className="flex flex-col gap-y-1">
                <span className="text-white text-xs font-medium ps5-text-glow">
                  {session?.user?.name?.split(" ")[0] +
                    " " +
                    session?.user?.name?.split(" ")[1]}
                </span>
                <div className="w-6 h-6 bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-gray-600/50 transition-all duration-300">
                  <Icons.EllipsisHorizontal className="text-white/80 size-3" />
                </div>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 min-w-[180px] p-2 mt-2">
            <DropdownMenuLabel className="text-white/60 text-xs font-medium uppercase tracking-wider px-2 py-1">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center justify-between cursor-pointer text-white/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-2 transition-all duration-300 group"
                >
                  <span className="text-sm font-medium group-hover:text-red-400 transition-colors duration-300">Sign Out</span>
                  <Icons.SignOut className="size-4 text-red-400 group-hover:text-red-400 transition-colors duration-300" />
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Dialog>
    </>
  );
}
