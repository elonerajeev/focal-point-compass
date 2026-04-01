import type { ThemePreview } from "../config/types";

export const systemService = {
  getThemePreviews(): Record<string, ThemePreview> {
    return {
      ocean: { 
        label: "Ocean", 
        subtitle: "Professional SaaS blue", 
        vibe: "Best for corporate CRM, sales leadership, and clean data density." 
      },
      midnight: { 
        label: "Midnight", 
        subtitle: "Dark executive mode", 
        vibe: "Best for night users, dense dashboards, and high-contrast workflows." 
      },
      nebula: { 
        label: "Nebula", 
        subtitle: "Startup premium gradient", 
        vibe: "Best for modern product teams and a more expressive brand feel." 
      },
      slate: { 
        label: "Slate", 
        subtitle: "Minimal enterprise", 
        vibe: "Best for conservative corporate environments and long-form work." 
      },
    };
  }
};
