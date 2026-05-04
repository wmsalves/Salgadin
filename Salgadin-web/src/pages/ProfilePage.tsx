import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Bell,
  CheckCircle2,
  Database,
  Download,
  Globe2,
  Lock,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import type {
  Expense,
  GoalAlert,
  NotificationItem,
  NotificationPreference,
} from "../lib/types";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../services/authService";
import { exportExpenses } from "../services/exportService";
import { getExpenses } from "../services/expenseService";
import {
  getNotificationAlerts,
  getNotificationPreferences,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../services/notificationService";

const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

function formatPhoneNumber(value: string) {
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
}

function downloadBlob(file: Blob, fileName: string) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.10)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { user, updateAuthUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailEnabled: false,
    pushEnabled: false,
    minimumThreshold: 0,
  });
  const [alerts, setAlerts] = useState<GoalAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isExportingExpenses, setIsExportingExpenses] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
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
  const displayName = profile?.name ?? user?.name ?? "Usuario";
  const hasExpenses = recentExpenses.length > 0;
  const unreadNotifications = notifications.filter((item) => !item.isRead).length;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setSettingsError(null);

    try {
      const [profileData, prefs, alertsData, notificationsData, expensesData] =
        await Promise.all([
          getMyProfile(),
          getNotificationPreferences(),
          getNotificationAlerts(now.getFullYear(), now.getMonth() + 1),
          getNotifications(),
          getExpenses(),
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
      setRecentExpenses(expensesData);
    } catch (error) {
      console.error("Falha ao carregar configuracoes:", error);
      setSettingsError(
        "Nao foi possivel carregar suas configuracoes agora. Tente novamente em instantes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [now]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSettingsMessage(null);
    setSettingsError(null);

    try {
      await updateNotificationPreferences(preferences);
      setSettingsMessage("Preferencias salvas com sucesso.");
    } catch (error) {
      console.error("Falha ao salvar preferencias:", error);
      setSettingsError("Nao foi possivel salvar as preferencias.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();
    const trimmedPhone = profileForm.phoneNumber.trim();
    const emailChanged = trimmedEmail !== (profile?.email ?? "").trim();
    const passwordChanged = Boolean(profileForm.newPassword);

    if (trimmedName.length < 3) {
      nextErrors.name = "O nome deve ter pelo menos 3 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Informe um email valido.";
    }

    if (trimmedPhone && !phonePattern.test(trimmedPhone)) {
      nextErrors.phoneNumber = "Use o formato (31) 98888-8888.";
    }

    if (passwordChanged && !strongPasswordPattern.test(profileForm.newPassword)) {
      nextErrors.newPassword =
        "Use 8+ caracteres, maiuscula, minuscula, numero e caractere especial.";
    }

    if ((emailChanged || passwordChanged) && !profileForm.currentPassword) {
      nextErrors.currentPassword =
        "Informe a senha atual para alterar email ou senha.";
    }

    if (profileForm.newPassword !== profileForm.confirmNewPassword) {
      nextErrors.confirmNewPassword = "A confirmacao da senha nao coincide.";
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
      setProfileMessage("Dados da conta atualizados com sucesso.");
    } catch (error) {
      console.error("Falha ao atualizar perfil:", error);
      setProfileError("Nao foi possivel atualizar o perfil. Verifique os dados informados.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleExportExpenses = async () => {
    setIsExportingExpenses(true);
    setSettingsMessage(null);
    setSettingsError(null);

    try {
      const file = await exportExpenses("csv");
      downloadBlob(file, "salgadin-despesas.csv");
      setSettingsMessage("Exportacao de despesas iniciada.");
    } catch (error) {
      console.error("Falha ao exportar despesas:", error);
      setSettingsError("Nao foi possivel exportar suas despesas agora.");
    } finally {
      setIsExportingExpenses(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  const handleMarkAllRead = async () => {
    setIsNotifying(true);
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setIsNotifying(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Conta e configuracoes
          </h1>
          <p className="text-sm text-foreground-muted">
            Carregando seus dados com seguranca...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-3xl border border-border/70 bg-surface-2"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Settings
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Conta e configuracoes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
            Controle seus dados, seguranca e preferencias em um unico lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1.5">
            Moeda: BRL
          </span>
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1.5">
            Idioma: pt-BR
          </span>
        </div>
      </header>

      {settingsError && (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {settingsError}
        </div>
      )}
      {settingsMessage && (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {settingsMessage}
        </div>
      )}

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.10)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xl font-semibold text-white">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`Foto de ${displayName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {displayName}
              </h2>
              <p className="text-sm text-foreground-muted">
                {profile?.email ?? user?.email ?? "Email nao informado"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Shield size={12} />
                  JWT ativo
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground-muted">
                  <CheckCircle2 size={12} />
                  Google Sign-In habilitado
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-border bg-surface-2 px-4 py-2 text-center text-sm font-semibold text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
          >
            Voltar ao painel
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <SettingsCard
            icon={User}
            title="Profile"
            description="Dados basicos usados no Salgadin e nas proximas integracoes."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm text-foreground-muted">
                  <User size={16} />
                  Nome
                </label>
                <input
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.name && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-foreground-muted">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.email && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
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
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-2 text-xs text-foreground-subtle">
                  Usaremos esse numero futuramente para recursos como WhatsApp.
                </p>
                {fieldErrors.phoneNumber && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {fieldErrors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Lock}
            title="Security"
            description="Altere senha e email com confirmacao da senha atual."
          >
            <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground-muted">
              Se voce entrou com Google e ainda nao definiu senha local, continue
              usando o Google Sign-In ate configurar uma senha pelo fluxo
              tradicional.
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-foreground-muted">
                  Senha atual
                </label>
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.currentPassword && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {fieldErrors.currentPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.newPassword && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={profileForm.confirmNewPassword}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      confirmNewPassword: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.confirmNewPassword && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {fieldErrors.confirmNewPassword}
                  </p>
                )}
              </div>
            </div>
          </SettingsCard>

          {profileError && (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {profileError}
            </div>
          )}
          {profileMessage && (
            <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {profileMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingProfile ? "Salvando..." : "Salvar conta"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <SettingsCard
            icon={Database}
            title="Data"
            description="Seus lancamentos pertencem a voce e podem ser baixados."
          >
            {hasExpenses ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface-2 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Exportar despesas
                  </h3>
                  <p className="mt-1 text-xs text-foreground-subtle">
                    CSV com Data, Descricao, Valor, Categoria e Subcategoria.
                    Periodo: todos os registros disponiveis.
                  </p>
                  <button
                    onClick={handleExportExpenses}
                    disabled={isExportingExpenses}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Download size={16} />
                    {isExportingExpenses ? "Preparando CSV..." : "Baixar CSV"}
                  </button>
                </div>
                <div className="rounded-2xl border border-border bg-surface-2 p-4 opacity-75">
                  <h3 className="text-sm font-semibold text-foreground">
                    Exportar rendas
                  </h3>
                  <p className="mt-1 text-xs text-foreground-subtle">
                    Em breve: exportacao separada das rendas cadastradas.
                  </p>
                  <button
                    disabled
                    className="mt-4 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground-muted"
                  >
                    Em breve
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Database}
                title="Sem despesas para exportar"
                description="Registre seu primeiro gasto para gerar um CSV com seus lancamentos financeiros."
                primaryAction={{ label: "Ir para o dashboard", href: "/dashboard" }}
                compact
              />
            )}
          </SettingsCard>

          <SettingsCard
            icon={Palette}
            title="Preferences"
            description="Preferencias basicas do app e alertas financeiros."
          >
            <div className="space-y-3">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm transition hover:bg-surface-3"
              >
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Palette size={16} />
                  Tema
                </span>
                <span className="font-semibold text-foreground">
                  {theme === "light" ? "Claro" : "Escuro"}
                </span>
              </button>
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Globe2 size={16} />
                  Idioma
                </span>
                <span className="font-semibold text-foreground">pt-BR</span>
              </div>
              <label className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
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
              <label className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
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
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
                <label className="flex items-center gap-2 text-foreground-muted">
                  <Shield size={16} />
                  Limiar minimo (0-1)
                </label>
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
                onClick={handleSavePreferences}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar preferencias"}
              </button>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={MessageCircle}
            title="Integrations"
            description="Conecte o Salgadin aos canais do seu dia a dia."
          >
            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    WhatsApp
                  </h3>
                  <p className="mt-1 text-xs text-foreground-subtle">
                    Em breve: lembretes e lancamentos rapidos pelo telefone.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Em breve
                </span>
              </div>
            </div>
          </SettingsCard>
        </div>
      </div>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surface-2/75 p-5 shadow-[0_14px_30px_rgba(60,42,32,0.10)] sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Alertas e notificacoes
            </h2>
            <p className="text-sm text-foreground-muted">
              {unreadNotifications > 0
                ? `${unreadNotifications} notificacao(oes) nao lida(s).`
                : "Tudo lido por aqui."}
            </p>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={isNotifying || notifications.length === 0}
            className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-3 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isNotifying ? "Atualizando..." : "Marcar tudo como lido"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Alertas do mes
            </h3>
            {alerts.length > 0 ? (
              <div className="mt-3 space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.goalId}
                    className="rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {alert.category || "Meta geral"}
                    </div>
                    <div className="mt-1 text-xs text-foreground-subtle">
                      R$ {alert.spent.toFixed(2)} de R${" "}
                      {alert.monthlyLimit.toFixed(2)}
                    </div>
                    <div
                      className={`mt-2 text-xs font-semibold ${
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
              <EmptyState
                icon={Shield}
                title="Nenhum alerta neste mes"
                description="Crie metas para receber avisos quando os pequenos gastos se aproximarem do limite."
                primaryAction={{ label: "Criar meta", href: "/metas" }}
                compact
                className="mt-3"
              />
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Notificacoes automaticas
            </h3>
            {notifications.length > 0 ? (
              <div className="mt-3 space-y-3">
                {notifications.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
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
                        className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
                      >
                        Marcar como lido
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="Sem notificacoes ainda"
                description="Quando uma meta ou alerta precisar da sua atencao, ele aparece aqui."
                compact
                className="mt-3"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
