import type { CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

export function useCarousel() {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      // Você pode adicionar lógica adicional aqui quando um slide for selecionado
    });
  }, [api]);

  return { api, setApi };
}
