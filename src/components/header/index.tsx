import { Icons } from "@/components/icons";
import { HeaderAvatar } from "./header-avatar";
import { TrophyInfo } from "./trophy-info";

export function Header() {
  function getCurrentHour() {
    var timeFormatted = Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    return timeFormatted;
  }

  return (
    <section className="w-full max-w-screen-2xl h-16 p-4 flex items-center mx-auto justify-between">
      <div className="flex items-center gap-x-2">
        <HeaderAvatar />
      </div>
      <TrophyInfo />
      <div className="flex items-center gap-4">
        <Icons.Wifi className="text-white" />
        <h3 className="text-white font-light">{getCurrentHour()}</h3>
      </div>
    </section>
  );
}
