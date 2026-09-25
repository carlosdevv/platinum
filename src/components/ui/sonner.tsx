"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "!border !border-white/12 !bg-[#111216]/95 !text-white !shadow-2xl !shadow-black/40 !backdrop-blur-2xl !rounded-xl !p-4 !min-w-[min(350px,calc(100vw-2rem))]",
          title: "!text-white",
          description: "!text-gray-300 !text-sm",
          closeButton: "!border-white/15 !bg-white/5 !text-white/70 hover:!bg-white/10 hover:!text-white",
          actionButton:
            "!bg-white/10 !text-gray-200 !border !border-white/15 hover:!bg-white/15 !transition-all !duration-300 !rounded-lg !px-3 !py-1 !text-xs !font-medium",
          cancelButton:
            "!bg-white/10 !text-gray-200 !border !border-white/15 hover:!bg-white/15 !transition-all !duration-300 !rounded-lg !px-3 !py-1 !text-xs !font-medium",
        },
      }}
      position="top-center"
      offset={{ top: 20 }}
      mobileOffset={{ top: 12 }}
      richColors={false}
      closeButton
      duration={4000}
      {...props}
    />
  );
};

export { Toaster };
