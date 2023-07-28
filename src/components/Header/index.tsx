"use client";

import { useGetProfileData } from "@/app/(services)/profile/useProfileService";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HeaderSettings } from "./header-settings";
import { TrophyInfo } from "./trophy-info";
import { useGameContext } from "@/context/useGameContext";

export function Header() {
  const { username } = useGameContext();
  const { data: profileProps, isLoading } = useGetProfileData(username, {
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // 1 hour
    enabled: username !== "",
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
        <HeaderSettings avatar={profileProps?.avatarUrl} />
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-white">
              @{username}
            </Button>
          </HoverCardTrigger>
          {profileProps?.aboutMe && (
            <HoverCardContent className="w-80">
              <div className="flex flex-col justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@{username}</h4>
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
