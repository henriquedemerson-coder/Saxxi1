import { type ReactElement } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SettingsPanel } from "./SettingsPanel";
import { useSettings } from "@/lib/settings-provider";

export function ThemeSettings({ children }: { children: ReactElement }) {
  const { preferences } = useSettings();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="z-[80] w-[calc(100%-2rem)] max-w-[400px] max-h-[85dvh] overflow-y-auto rounded-lg" aria-describedby={undefined}>
        <DialogTitle>{preferences.language === "en" ? "Settings" : "Configurações"}</DialogTitle>
        <SettingsPanel />
      </DialogContent>
    </Dialog>
  );
}