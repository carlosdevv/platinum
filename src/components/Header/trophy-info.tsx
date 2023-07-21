import {
  bronzeTrophy,
  goldTrophy,
  platinumTrophy,
  silverTrophy,
} from "@/components/Icons";
import Image from "next/image";
import { SkeletonTrophies } from "./skeleton-trophies";

type TrophyInfoProps = {
  isLoading: boolean;
  trophySummary?: {
    level: number;
    progress: number;
    bronzeCount: number;
    silverCount: number;
    goldCount: number;
    platinumCount: number;
  };
};
export function TrophyInfo({ trophySummary, isLoading }: TrophyInfoProps) {
  return (
    <>
      {isLoading ? (
        <SkeletonTrophies />
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-end gap-2">
            <Image
              src={platinumTrophy}
              alt="platinumTrophy"
              width={20}
              height={20}
            />
            <h4 className="text-white font-semibold">
              {trophySummary?.platinumCount}
            </h4>
          </div>
          <div className="flex items-end gap-2">
            <Image src={goldTrophy} alt="goldTrophy" width={20} height={20} />
            <h4 className="text-white font-semibold">
              {trophySummary?.goldCount}
            </h4>
          </div>
          <div className="flex items-end gap-2">
            <Image
              src={silverTrophy}
              alt="silverTrophy"
              width={20}
              height={20}
            />
            <h4 className="text-white font-semibold">
              {trophySummary?.silverCount}
            </h4>
          </div>
          <div className="flex items-end gap-2">
            <Image
              src={bronzeTrophy}
              alt="bronzeTrophy"
              width={20}
              height={20}
            />
            <h4 className="text-white font-semibold">
              {trophySummary?.bronzeCount}
            </h4>
          </div>
        </div>
      )}
    </>
  );
}
