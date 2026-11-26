import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, RefreshCw } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import type { NotificationItem } from "../lib/types";
import { PageHeader } from "../components/PageHeader";

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

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              filter === "all"
                ? "bg-primary text-[var(--color-on-primary)]"
                : "border border-border text-foreground-muted"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              filter === "unread"
                ? "bg-primary text-[var(--color-on-primary)]"
                : "border border-border text-foreground-muted"
            }`}
          >
            Nao lidas ({unreadCount})
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        {isLoading ? (
          <div className="text-sm text-foreground-subtle">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-foreground-subtle">
            <div className="h-12 w-12 rounded-full border border-border bg-surface-2 grid place-items-center">
              <Bell size={20} />
            </div>
            Nenhuma notificação encontrada.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="text-xs rounded-full bg-primary/20 text-primary px-2 py-0.5">
                        Novo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground-subtle mt-1">
                    {item.message}
                  </p>
                  <p className="text-xs text-foreground-muted mt-2">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkOne(item.id)}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-3 transition"
                  >
                    Marcar como lido
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
