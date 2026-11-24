import type { ReactNode } from "react";

/**
 * Centers the app in a phone-shaped viewport on desktop,
 * full-bleed on mobile. SAXXI is mobile-first.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh relative pb-28">
        {children}
      </div>
    </div>
  );
}
