"use client";

import { useGetProfileData } from "@/app/(services)/profile/useProfileService";
import { Icons } from "@/components/Icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "../ui/skeleton";
import { TrophyInfo } from "./trophy-info";

export function Header() {
  const userName = "tikao_lo";
  const { data: profileProps, isLoading } = useGetProfileData(userName, {
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // 1 hour
    refetchOnMount: false,
    enabled: !!userName,
  });

  function getCurrentHour() {
    var timeFormatted = Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    return timeFormatted;
  }

  return (
    <section className="w-full max-w-screen-2xl h-16 p-4 flex items-center mx-auto justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={profileProps?.avatarUrl} alt="profilePic" />
          <AvatarFallback>
            <Skeleton className="h-10 w-10 rounded-full" />
          </AvatarFallback>
        </Avatar>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-white">
              @{userName}
            </Button>
          </HoverCardTrigger>
          {profileProps?.aboutMe && (
            <HoverCardContent className="w-80">
              <div className="flex flex-col justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@{userName}</h4>
                  <p className="text-sm">{profileProps?.aboutMe}</p>
                </div>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      </div>
      <TrophyInfo
        trophySummary={profileProps?.trophySummary}
        isLoading={isLoading}
      />
      <div className="flex items-center gap-4">
        <Icons.Wifi className="text-white" />
        <h3 className="text-white font-light">{getCurrentHour()}</h3>
      </div>
    </section>
  );
}
