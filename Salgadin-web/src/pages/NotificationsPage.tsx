import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, RefreshCw } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import type { NotificationItem } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { AnimatePresence, motion } from "framer-motion";
import { listItemMotion } from "../lib/motion";

type FilterMode = "all" | "unread";

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchItems = async (mode: FilterMode) => {
    setIsLoading(true);
    const data = await getNotifications(mode === "unread");
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems(filter);
  }, [filter]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const handleMarkAll = async () => {
    setIsUpdating(true);
    await markAllNotificationsRead();
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setIsUpdating(false);
  };

  const handleMarkOne = async (id: number) => {
    await markNotificationRead(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description="Avisos das suas metas e recorrências."
        actions={
          <>
            <button type="button" onClick={() => fetchItems(filter)} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-ui font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw size={15} />
              Atualizar
            </button>
            <button type="button" onClick={handleMarkAll} disabled={isUpdating || items.length === 0} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-ui font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50">
              <CheckCircle2 size={15} />
              {isUpdating ? "Atualizando..." : "Marcar tudo como lido"}
            </button>
          </>
        }
      />

      <div
        role="radiogroup"
        aria-label="Filtrar notificações"
        className="inline-flex w-fit rounded-[var(--radius-control)] border border-border bg-surface p-1"
      >
        {(
          [
            ["all", "Todas"],
            ["unread", `Não lidas${unreadCount > 0 ? ` (${unreadCount})` : ""}`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={filter === value}
            onClick={() => setFilter(value)}
            className={`rounded-md px-3 py-1.5 text-ui font-medium transition-colors ${
              filter === value
                ? "bg-background text-foreground shadow-[var(--shadow-card)]"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando notificações">
          {[0, 1].map((index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "Tudo lido por aqui" : "Nenhum aviso ainda"}
          description={
            filter === "unread"
              ? "Você não tem notificações pendentes."
              : "Quando uma meta chegar perto do limite ou uma recorrência vencer, o aviso aparece aqui."
          }
          compact
        />
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout="position"
                {...listItemMotion}
                className="flex flex-col gap-3 overflow-hidden border-t border-border px-5 py-4 first:border-t-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-primary"}`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm ${item.isRead ? "text-foreground-muted" : "font-medium text-foreground"}`}>
                      {item.title}
                      {!item.isRead && <span className="sr-only"> (não lida)</span>}
                    </p>
                    <p className="mt-0.5 text-ui text-foreground-muted">{item.message}</p>
                    <p className="mt-1 text-xs text-foreground-subtle">
                      {new Date(item.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkOne(item.id)}
                    className="shrink-0 self-start rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-ui font-medium text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground md:self-auto"
                  >
                    Marcar como lida
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
