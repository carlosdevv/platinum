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
          <DropdownMenuTrigger className="flex items-center gap-2">
            <Avatar className="cursor-pointer">
              {!isLoading && session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <AvatarFallback>
                  <Skeleton className="size-10 flex items-center justify-center rounded-full">
                    {session?.user?.name?.[0]?.toUpperCase()}
                  </Skeleton>
                </AvatarFallback>
              )}
            </Avatar>
            {!isLoading && (
              <div className="flex flex-col gap-y-1">
                <span className="text-white text-xs font-semibold">
                  {session?.user?.name?.split(" ")[0] +
                    " " +
                    session?.user?.name?.split(" ")[1]}
                </span>
                <Icons.EllipsisHorizontal className="text-white p-1 rounded-full bg-gray-700 size-5" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>Sign Out</span>
                  <Icons.SignOut className="size-4" />
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Dialog>
    </>
  );
}
