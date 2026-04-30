import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, User, Shield, Bell } from "lucide-react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationAlerts,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";
import type {
  GoalAlert,
  NotificationPreference,
  NotificationItem,
} from "../lib/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailEnabled: false,
    pushEnabled: false,
    minimumThreshold: 0,
  });
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const now = useMemo(() => new Date(), []);

  const fetchData = async () => {
    const [prefs, alertsData, notificationsData] = await Promise.all([
      getNotificationPreferences(),
      getNotificationAlerts(now.getFullYear(), now.getMonth() + 1),
      getNotifications(),
    ]);
    setPreferences(prefs);
    setAlerts(alertsData);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await updateNotificationPreferences(preferences);
    setIsSaving(false);
  };

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const handleMarkAllRead = async () => {
    setIsNotifying(true);
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );
    setIsNotifying(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-foreground-muted">
            Gerencie suas informacoes pessoais e preferencias.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500 fade-in">
        <section className="lg:col-span-2 rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informacoes da conta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border border-border bg-surface-2 p-5 animate-fade-in opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <User size={16} />
                Nome
              </div>
              <div className="mt-2 text-base font-semibold text-foreground">
                {user?.name || "Usuario"}
              </div>
            </div>
            <div
              className="rounded-2xl border border-border bg-surface-2 p-5 animate-fade-in opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Mail size={16} />
                Email
              </div>
              <div className="mt-2 text-base font-semibold text-foreground">
                {"usuario@email.com"}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Preferencias
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-foreground-muted">
                <Bell size={16} />
                Alertas por email
              </span>
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailEnabled: event.target.checked,
                  }))
                }
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-foreground-muted">
                <Bell size={16} />
                Alertas push
              </span>
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    pushEnabled: event.target.checked,
                  }))
                }
              />
            </label>
            <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-foreground-muted">
                <Shield size={16} />
                Limiar minimo (0-1)
              </div>
              <input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={preferences.minimumThreshold}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    minimumThreshold: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar preferencias"}
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] animate-in zoom-in-95 duration-500 fade-in delay-150 [animation-fill-mode:backwards]">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Alertas do mes
        </h2>
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, index) => (
              <div
                key={alert.goalId}
                style={{ animationDelay: `${index * 100}ms` }}
                className="rounded-2xl border border-border bg-surface-2 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-600 animate-fade-in opacity-0 [animation-fill-mode:forwards]"
              >
                <div className="text-sm font-semibold text-foreground">
                  {alert.category || "Meta geral"}
                </div>
                <div className="mt-1 text-xs text-foreground-subtle">
                  R$ {alert.spent.toFixed(2)} de R${" "}
                  {alert.monthlyLimit.toFixed(2)}
                </div>
                <div
                  className={`mt-3 text-xs font-semibold ${
                    alert.thresholdReached ? "text-danger" : "text-primary"
                  }`}
                >
                  {alert.thresholdReached
                    ? "Limiar atingido"
                    : "Dentro do limite"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground-subtle">
            Nenhum alerta encontrado para este mes.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)] animate-in zoom-in-95 duration-500 fade-in delay-200 [animation-fill-mode:backwards]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Notificacoes automaticas
          </h2>
          <button
            onClick={handleMarkAllRead}
            disabled={isNotifying || notifications.length === 0}
            className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-3 transition disabled:opacity-60"
          >
            {isNotifying ? "Atualizando..." : "Marcar tudo como lido"}
          </button>
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span className="text-[10px] uppercase tracking-wide rounded-full bg-primary/20 text-primary px-2 py-0.5">
                        Novo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground-subtle mt-1">
                    {notification.message}
                  </p>
                  <p className="text-[11px] text-foreground-muted mt-2">
                    {new Date(notification.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-3 transition"
                  >
                    Marcar como lido
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground-subtle">
            Nenhuma notificacao gerada ate o momento.
          </p>
        )}
      </section>
    </div>
  );
}
