"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-800/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border group-[.toaster]:border-gray-600/30 group-[.toaster]:text-white group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:min-w-[350px]",
          description: "group-[.toast]:text-gray-300 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-gray-700/50 group-[.toast]:text-gray-200 group-[.toast]:border group-[.toast]:border-gray-500/30 group-[.toast]:hover:bg-gray-600/50 group-[.toast]:transition-all group-[.toast]:duration-300 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-gray-700/50 group-[.toast]:text-gray-200 group-[.toast]:border group-[.toast]:border-gray-500/30 group-[.toast]:hover:bg-gray-600/50 group-[.toast]:transition-all group-[.toast]:duration-300 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium",
        },
      }}
      position="bottom-right"
      richColors={false}
      closeButton
      duration={4000}
      {...props}
    />
  );
};

export { Toaster };
