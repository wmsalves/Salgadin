import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, User, Shield, Bell, Phone, KeyRound } from "lucide-react";
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
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../services/authService";

export default function ProfilePage() {
  const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  const strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
  const { user, updateAuthUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailEnabled: false,
    pushEnabled: false,
    minimumThreshold: 0,
  });
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const now = useMemo(() => new Date(), []);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) {
      return digits.length > 0 ? `(${digits}` : "";
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const fetchData = async () => {
    const [profileData, prefs, alertsData, notificationsData] = await Promise.all([
      getMyProfile(),
      getNotificationPreferences(),
      getNotificationAlerts(now.getFullYear(), now.getMonth() + 1),
      getNotifications(),
    ]);

    setProfile(profileData);
    setProfileForm({
      name: profileData.name,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber ?? "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
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

  const handleSaveProfile = async () => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();
    const trimmedPhone = profileForm.phoneNumber.trim();

    if (trimmedName.length < 3) {
      nextErrors.name = "O nome deve ter pelo menos 3 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Informe um email válido.";
    }

    if (trimmedPhone && !phonePattern.test(trimmedPhone)) {
      nextErrors.phoneNumber = "Use o formato (31) 98888-8888.";
    }

    if (profileForm.newPassword && !strongPasswordPattern.test(profileForm.newPassword)) {
      nextErrors.newPassword =
        "A senha deve ter 8+ caracteres, maiúscula, minúscula, número e caractere especial.";
    }

    if (profileForm.newPassword && !profileForm.currentPassword) {
      nextErrors.currentPassword = "Informe a senha atual para alterar email ou senha.";
    }

    if (profileForm.newPassword !== profileForm.confirmNewPassword) {
      nextErrors.confirmNewPassword = "A confirmação da senha não coincide.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setProfileError("Corrija os campos destacados antes de salvar.");
      setProfileMessage(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const response = await updateMyProfile({
        name: trimmedName,
        email: trimmedEmail,
        phoneNumber: trimmedPhone || null,
        currentPassword: profileForm.currentPassword || undefined,
        newPassword: profileForm.newPassword || undefined,
        confirmNewPassword: profileForm.confirmNewPassword || undefined,
      });

      updateAuthUser(response.token);
      setProfile(response.profile);
      setProfileForm((prev) => ({
        ...prev,
        name: response.profile.name,
        email: response.profile.email,
        phoneNumber: response.profile.phoneNumber ?? "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      setFieldErrors({});
      setProfileMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error("Falha ao atualizar perfil:", error);
      setProfileError("Nao foi possivel atualizar o perfil. Verifique os dados informados.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  };

  const handleMarkAllRead = async () => {
    setIsNotifying(true);
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true })),
    );
    setIsNotifying(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-foreground-muted">
            Gerencie sua conta, preferências e preparo para integrações futuras.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
          <div className="mb-6 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-xl font-semibold text-white">
              {(profile?.name ?? user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Dados da conta
              </h2>
              <p className="text-sm text-foreground-muted">
                Atualize nome, email, telefone e senha.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-2 p-5">
              <label className="flex items-center gap-2 text-sm text-foreground-muted">
                <User size={16} />
                Nome
              </label>
              <input
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              {fieldErrors.name && (
                <p className="mt-2 text-xs font-medium text-danger">{fieldErrors.name}</p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-5">
              <label className="flex items-center gap-2 text-sm text-foreground-muted">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              {fieldErrors.email && (
                <p className="mt-2 text-xs font-medium text-danger">{fieldErrors.email}</p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-5">
              <label className="flex items-center gap-2 text-sm text-foreground-muted">
                <Phone size={16} />
                Telefone
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={profileForm.phoneNumber}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    phoneNumber: formatPhoneNumber(event.target.value),
                  }))
                }
                placeholder="Ex: (31) 98888-8888"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              {fieldErrors.phoneNumber && (
                <p className="mt-2 text-xs font-medium text-danger">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-5">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Shield size={16} />
                Status da conta
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">
                {profile?.email ?? user?.email ?? "Sem email"}
              </div>
              <p className="mt-2 text-xs text-foreground-subtle">
                O telefone será útil para integrações futuras, inclusive WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface-2 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-foreground-muted">
              <KeyRound size={16} />
              Segurança
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                type="password"
                value={profileForm.currentPassword}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                placeholder="Senha atual"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              {fieldErrors.currentPassword && (
                <p className="text-xs font-medium text-danger">{fieldErrors.currentPassword}</p>
              )}
              <input
                type="password"
                value={profileForm.newPassword}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                placeholder="Nova senha"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              {fieldErrors.newPassword && (
                <p className="text-xs font-medium text-danger">{fieldErrors.newPassword}</p>
              )}
              <input
                type="password"
                value={profileForm.confirmNewPassword}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    confirmNewPassword: event.target.value,
                  }))
                }
                placeholder="Confirmar nova senha"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              {fieldErrors.confirmNewPassword && (
                <p className="text-xs font-medium text-danger">{fieldErrors.confirmNewPassword}</p>
              )}
            </div>
            <p className="mt-3 text-xs text-foreground-subtle">
              Para trocar email ou senha, informe a senha atual.
            </p>
          </div>

          {profileError && (
            <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {profileError}
            </div>
          )}
          {profileMessage && (
            <div className="mt-4 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {profileMessage}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
            >
              {isSavingProfile ? "Salvando..." : "Salvar dados da conta"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
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

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Alertas do mes
        </h2>
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.goalId}
                className="rounded-2xl border border-border bg-surface-2 p-5"
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
                  {alert.thresholdReached ? "Limiar atingido" : "Dentro do limite"}
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

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-6 shadow-[0_14px_30px_rgba(60,42,32,0.10)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between"
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
                  <p className="mt-1 text-xs text-foreground-subtle">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-[11px] text-foreground-muted">
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
