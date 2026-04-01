import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { toast } from "@/components/ui/sonner";
import { triggerHaptic } from "@/lib/micro-interactions";
import { readStoredJSON, writeStoredJSON } from "@/lib/preferences";

export type NotificationCategory = "collaboration" | "search" | "dashboard" | "message" | "finance" | "system";

export interface WorkspaceNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  createdAt: string;
  unread: boolean;
  count: number;
  batchKey: string;
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  liveUpdates: boolean;
  batching: boolean;
}

interface NotificationContextValue {
  notifications: WorkspaceNotification[];
  unreadCount: number;
  centerOpen: boolean;
  preferences: NotificationPreferences;
  openCenter: () => void;
  closeCenter: () => void;
  toggleCenter: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  pushNotification: (notification: Omit<WorkspaceNotification, "id" | "createdAt" | "unread" | "count"> & { count?: number }) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const storageKey = "crm-notifications";
const preferenceKey = "crm-notification-preferences";
const centerKey = "crm-notification-center";

const defaultPreferences: NotificationPreferences = {
  inApp: true,
  email: false,
  sms: false,
  liveUpdates: true,
  batching: true,
};

const defaultNotifications: WorkspaceNotification[] = [
  {
    id: "seed-collaboration",
    title: "Sarah joined the dashboard review",
    description: "A collaborator is now watching the executive summary.",
    category: "collaboration",
    createdAt: new Date().toISOString(),
    unread: true,
    count: 1,
    batchKey: "collaboration-review",
  },
  {
    id: "seed-dashboard",
    title: "Weekly report pack is ready",
    description: "Two report cards were refreshed from the latest snapshot.",
    category: "dashboard",
    createdAt: new Date().toISOString(),
    unread: true,
    count: 1,
    batchKey: "dashboard-report-pack",
  },
];

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedNotifications() {
  return defaultNotifications.map((item) => ({
    ...item,
    createdAt: new Date().toISOString(),
  }));
}

function simulateFeedItem(sequence: number): Omit<WorkspaceNotification, "id" | "createdAt" | "unread" | "count"> {
  const items = [
    {
      title: "New client activity detected",
      description: "A high-value account moved into follow-up mode.",
      category: "dashboard" as const,
      batchKey: "activity-client",
    },
    {
      title: "Collaborator presence updated",
      description: "Live review is active on the dashboard canvas.",
      category: "collaboration" as const,
      batchKey: "presence-dashboard",
    },
    {
      title: "Search preset saved",
      description: "Your recent filters were preserved for quick reuse.",
      category: "search" as const,
      batchKey: "search-preset",
    },
    {
      title: "Invoice reminder queued",
      description: "Batch delivery is grouped for the next finance cycle.",
      category: "finance" as const,
      batchKey: "finance-reminder",
    },
    {
      title: "Team message bundle received",
      description: "Three related updates were grouped into one stream item.",
      category: "message" as const,
      batchKey: "message-bundle",
    },
  ];

  return items[sequence % items.length];
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>(() => {
    const saved = readStoredJSON<WorkspaceNotification[]>(storageKey, []);
    return saved.length ? saved : seedNotifications();
  });
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    readStoredJSON<NotificationPreferences>(preferenceKey, defaultPreferences),
  );
  const [centerOpen, setCenterOpen] = useState(() => readStoredJSON<boolean>(centerKey, false));

  useEffect(() => {
    writeStoredJSON(storageKey, notifications);
  }, [notifications]);

  useEffect(() => {
    writeStoredJSON(preferenceKey, preferences);
  }, [preferences]);

  useEffect(() => {
    writeStoredJSON(centerKey, centerOpen);
  }, [centerOpen]);

  const pushNotification = useCallback(
    (
    notification: Omit<WorkspaceNotification, "id" | "createdAt" | "unread" | "count"> & { count?: number },
    silent = false,
    ) => {
      const now = new Date().toISOString();

      setNotifications((current) => {
        const nextCount = notification.count ?? 1;
        const existing = current[0];
        const shouldBatch =
          preferences.batching &&
          existing &&
          existing.batchKey === notification.batchKey &&
          new Date(now).getTime() - new Date(existing.createdAt).getTime() < 5 * 60 * 1000;

        if (shouldBatch) {
          const updated = {
            ...existing,
            title: notification.title,
            description: notification.description,
            createdAt: now,
            unread: true,
            count: existing.count + nextCount,
          };
          return [updated, ...current.slice(1)];
        }

        return [
          {
            id: buildId(notification.category),
            createdAt: now,
            unread: true,
            count: nextCount,
            ...notification,
          },
          ...current,
        ].slice(0, 24);
      });

      if (!silent) {
        triggerHaptic(notification.category === "system" ? "error" : notification.category === "search" ? "selection" : "light");

        if (preferences.inApp) {
          const notify =
            notification.category === "system"
              ? toast.error
              : notification.category === "collaboration" || notification.category === "dashboard"
                ? toast.success
                : toast;

          notify(notification.title, {
            description: notification.description,
            action: {
              label: "Open center",
              onClick: () => setCenterOpen(true),
            },
          });
        }
      }
    },
    [preferences.batching, preferences.inApp],
  );

  useEffect(() => {
    if (!preferences.liveUpdates) return undefined;

    let sequence = 0;
    const interval = window.setInterval(() => {
      const next = simulateFeedItem(sequence);
      sequence += 1;
      pushNotification(next, true);
    }, 18000);

    return () => window.clearInterval(interval);
  }, [preferences.liveUpdates, pushNotification]);

  const markRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification)),
    );
    triggerHaptic("selection");
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
    triggerHaptic("success");
  }, []);

  const setPreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    triggerHaptic("selection");
  }, []);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      centerOpen,
      preferences,
      openCenter: () => setCenterOpen(true),
      closeCenter: () => setCenterOpen(false),
      toggleCenter: () => setCenterOpen((current) => !current),
      markRead,
      markAllRead,
      setPreference,
      pushNotification,
    }),
    [centerOpen, markAllRead, markRead, notifications, preferences, pushNotification, setPreference, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
