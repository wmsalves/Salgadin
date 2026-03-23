import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, User, Shield, Bell } from "lucide-react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationAlerts,
} from "../services/notificationService";
import type { GoalAlert, NotificationPreference } from "../lib/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailEnabled: false,
    pushEnabled: false,
    minimumThreshold: 0,
  });
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const now = useMemo(() => new Date(), []);

  const fetchData = async () => {
    const [prefs, alertsData] = await Promise.all([
      getNotificationPreferences(),
      getNotificationAlerts(now.getFullYear(), now.getMonth() + 1),
    ]);
    setPreferences(prefs);
    setAlerts(alertsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await updateNotificationPreferences(preferences);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-foreground-muted">
            Gerencie suas informacoes pessoais e preferencias.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informacoes da conta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <User size={16} />
                Nome
              </div>
              <div className="mt-2 text-base font-semibold text-foreground">
                {user?.name || "Usuario"}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
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

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
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

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Alertas do mes
        </h2>
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.goalId}
                className="rounded-xl border border-border bg-surface-2 p-4"
              >
                <div className="text-sm font-semibold text-foreground">
                  {alert.category || "Meta geral"}
                </div>
                <div className="mt-1 text-xs text-foreground-subtle">
                  R$ {alert.spent.toFixed(2)} de R$ {alert.monthlyLimit.toFixed(2)}
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
    </div>
  );
}
