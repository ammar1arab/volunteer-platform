"use client";

import { createContext, useContext, createElement, type ReactNode } from "react";
import { useNotifications } from "@/presentation/hooks";

type NotificationsContextValue = ReturnType<typeof useNotifications>;

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const value = useNotifications();
  return createElement(NotificationsContext.Provider, { value }, children);
};

export const useNotificationsContext = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
};