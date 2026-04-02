import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { triggerHaptic } from "@/lib/micro-interactions";

type WorkspaceContextValue = {
  commandOpen: boolean;
  quickCreateOpen: boolean;
  canUseQuickCreate: boolean;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openQuickCreate: () => void;
  closeQuickCreate: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { role } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const canUseQuickCreate = role === "admin" || role === "manager";
  const togglePrivacyMode = () => setPrivacyMode(v => !v);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isCommandPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isQuickCreate = event.shiftKey && event.key.toLowerCase() === "n";

      if (isCommandPalette) {
        event.preventDefault();
        setCommandOpen((current) => !current);
        triggerHaptic("selection");
      }

      if (isQuickCreate && canUseQuickCreate) {
        event.preventDefault();
        setQuickCreateOpen(true);
        triggerHaptic("medium");
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [canUseQuickCreate]);

  const value = useMemo(
    () => ({
      commandOpen,
      quickCreateOpen,
      canUseQuickCreate,
      privacyMode,
      togglePrivacyMode,
      openCommandPalette: () => {
        setCommandOpen(true);
        triggerHaptic("selection");
      },
      closeCommandPalette: () => setCommandOpen(false),
      openQuickCreate: () => {
        if (canUseQuickCreate) {
          setQuickCreateOpen(true);
          triggerHaptic("medium");
        }
      },
      closeQuickCreate: () => setQuickCreateOpen(false),
    }),
    [canUseQuickCreate, commandOpen, quickCreateOpen, privacyMode],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return context;
}
