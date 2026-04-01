import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, RefreshCw } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import type { NotificationItem } from "../lib/types";

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificacoes</h1>
          <p className="text-sm text-foreground-muted">
            Acompanhe alertas automaticos e marque como lido.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchItems(filter)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
          <button
            onClick={handleMarkAll}
            disabled={isUpdating || items.length === 0}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-surface-3 hover:bg-surface-2 transition disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {isUpdating ? "Atualizando..." : "Marcar tudo como lido"}
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              filter === "all"
                ? "bg-primary text-white"
                : "border border-border text-foreground-muted"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              filter === "unread"
                ? "bg-primary text-white"
                : "border border-border text-foreground-muted"
            }`}
          >
            Nao lidas ({unreadCount})
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/90 via-surface/75 to-surface-2/70 backdrop-blur-xl p-6 shadow-[0_18px_40px_rgba(60,42,32,0.12)]">
        {isLoading ? (
          <div className="text-sm text-foreground-subtle">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-foreground-subtle">
            <div className="h-12 w-12 rounded-full border border-border bg-surface-2 grid place-items-center">
              <Bell size={20} />
            </div>
            Nenhuma notificacao encontrada.
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
                    <span className="text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="text-[10px] uppercase tracking-wide rounded-full bg-primary/20 text-primary px-2 py-0.5">
                        Novo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground-subtle mt-1">
                    {item.message}
                  </p>
                  <p className="text-[11px] text-foreground-muted mt-2">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkOne(item.id)}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-3 transition"
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
