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
import { EmptyState } from "../components/EmptyState";
import { WhatsAppSimulationPanel } from "../components/settings/WhatsAppSimulationPanel";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import type {
  Expense,
  GoalAlert,
  Income,
  NotificationItem,
  NotificationPreference,
} from "../lib/types";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../services/authService";
import { exportExpenses, exportIncomes } from "../services/exportService";
import { getExpenses } from "../services/expenseService";
import { getIncomes } from "../services/incomeService";
import {
  getNotificationAlerts,
  getNotificationPreferences,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../services/notificationService";
import {
  disconnectWhatsApp,
  generateWhatsAppLinkCode,
  getWhatsAppStatus,
  type WhatsAppLinkCode,
  type WhatsAppStatus,
} from "../services/whatsAppService";
import { PageHeader } from "../components/PageHeader";

const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const isWhatsAppSimulatorEnabled =
  import.meta.env.DEV ||
  import.meta.env.VITE_ENABLE_WHATSAPP_SIMULATOR === "true";

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
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">
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
  const [recentIncomes, setRecentIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isExportingExpenses, setIsExportingExpenses] = useState(false);
  const [isExportingIncomes, setIsExportingIncomes] = useState(false);
  const [isGeneratingWhatsAppCode, setIsGeneratingWhatsAppCode] =
    useState(false);
  const [isDisconnectingWhatsApp, setIsDisconnectingWhatsApp] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState<string | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus | null>(
    null,
  );
  const [whatsAppLinkCode, setWhatsAppLinkCode] =
    useState<WhatsAppLinkCode | null>(null);
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
  const displayName = profile?.name ?? user?.name ?? "Usuário";
  const hasExpenses = recentExpenses.length > 0;
  const hasIncomes = recentIncomes.length > 0;
  const hasExportableData = hasExpenses || hasIncomes;
  const unreadNotifications = notifications.filter(
    (item) => !item.isRead,
  ).length;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setSettingsError(null);

    try {
      const [
        profileData,
        prefs,
          alertsData,
          notificationsData,
          expensesData,
          incomesData,
          whatsAppStatusData,
        ] = await Promise.all([
          getMyProfile(),
          getNotificationPreferences(),
          getNotificationAlerts(now.getFullYear(), now.getMonth() + 1),
          getNotifications(),
          getExpenses(),
          getIncomes(),
          getWhatsAppStatus().catch(() => ({
            connected: false,
            phoneNumber: null,
        })),
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
        setRecentIncomes(incomesData);
        setWhatsAppStatus(whatsAppStatusData);
    } catch (error) {
      console.error("Falha ao carregar configurações:", error);
      setSettingsError(
        "Não foi possível carregar suas configurações agora. Tente novamente em instantes.",
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
      setSettingsMessage("Preferências salvas com sucesso.");
    } catch (error) {
      console.error("Falha ao salvar preferências:", error);
      setSettingsError("Não foi possível salvar as preferências.");
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
      nextErrors.email = "Informe um email válido.";
    }

    if (trimmedPhone && !phonePattern.test(trimmedPhone)) {
      nextErrors.phoneNumber = "Use o formato (31) 98888-8888.";
    }

    if (
      passwordChanged &&
      !strongPasswordPattern.test(profileForm.newPassword)
    ) {
      nextErrors.newPassword =
        "Use 8+ caracteres, maiúscula, minúscula, número e caractere especial.";
    }

    if ((emailChanged || passwordChanged) && !profileForm.currentPassword) {
      nextErrors.currentPassword =
        "Informe a senha atual para alterar email ou senha.";
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
      setProfileMessage("Dados da conta atualizados com sucesso.");
    } catch (error) {
      console.error("Falha ao atualizar perfil:", error);
      setProfileError(
        "Não foi possível atualizar o perfil. Verifique os dados informados.",
      );
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
      setSettingsMessage("Exportação de despesas iniciada.");
    } catch (error) {
      console.error("Falha ao exportar despesas:", error);
      setSettingsError("Não foi possível exportar suas despesas agora.");
    } finally {
      setIsExportingExpenses(false);
    }
  };

  const handleExportIncomes = async () => {
    setIsExportingIncomes(true);
    setSettingsMessage(null);
    setSettingsError(null);

    try {
      const file = await exportIncomes();
      downloadBlob(file, "salgadin-rendas.csv");
      setSettingsMessage("Exportação de rendas iniciada.");
    } catch (error) {
      console.error("Falha ao exportar rendas:", error);
      setSettingsError("Não foi possível exportar suas rendas agora.");
    } finally {
      setIsExportingIncomes(false);
    }
  };

  const handleGenerateWhatsAppCode = async () => {
    setIsGeneratingWhatsAppCode(true);
    setWhatsAppMessage(null);
    setWhatsAppError(null);

    try {
      const code = await generateWhatsAppLinkCode();
      const status = await getWhatsAppStatus();
      setWhatsAppLinkCode(code);
      setWhatsAppStatus(status);
      setWhatsAppMessage("Código de conexão gerado.");
    } catch (error) {
      console.error("Falha ao gerar código do WhatsApp:", error);
      setWhatsAppError(
        "Não foi possível gerar o código. Verifique se seu telefone está salvo no perfil.",
      );
    } finally {
      setIsGeneratingWhatsAppCode(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    setIsDisconnectingWhatsApp(true);
    setWhatsAppMessage(null);
    setWhatsAppError(null);

    try {
      await disconnectWhatsApp();
      setWhatsAppStatus({ connected: false, phoneNumber: null });
      setWhatsAppLinkCode(null);
      setWhatsAppMessage("WhatsApp desconectado.");
    } catch (error) {
      console.error("Falha ao desconectar WhatsApp:", error);
      setWhatsAppError("Não foi possível desconectar o WhatsApp agora.");
    } finally {
      setIsDisconnectingWhatsApp(false);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            Conta e configurações
          </h1>
          <p className="text-sm text-foreground-muted">
            Carregando seus dados com segurança...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border border-border bg-surface-2"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conta e configurações"
        description="Seus dados, segurança, preferências e exportação em um só lugar."
      />

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

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xl font-medium text-[var(--color-on-primary)]">
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
              <h2 className="text-base font-medium text-foreground">
                {displayName}
              </h2>
              <p className="text-sm text-foreground-muted">
                {profile?.email ?? user?.email ?? "Email não informado"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="space-y-5 xl:space-y-6">
          <SettingsCard
            icon={User}
            title="Perfil"
            description="Dados básicos usados no Salgadin e nas próximas integrações."
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
                  Usaremos esse número futuramente para recursos como WhatsApp.
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
            title="Segurança"
            description="Altere senha e email com confirmação da senha atual."
          >
            <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground-muted">
              Se você entrou com Google e ainda não definiu senha local,
              continue usando o Google Sign-In até configurar uma senha pelo
              fluxo tradicional.
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

            <div className="mt-5 flex justify-stretch sm:justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-[var(--color-on-primary)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
              >
                {isSavingProfile ? "Salvando..." : "Salvar conta"}
              </button>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Palette}
            title="Preferências"
            description="Preferências básicas do app e alertas financeiros."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm transition hover:bg-surface-3"
              >
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Palette size={16} />
                  Tema
                </span>
                <span className="font-medium text-foreground">
                  {theme === "light" ? "Claro" : "Escuro"}
                </span>
              </button>
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Globe2 size={16} />
                  Idioma
                </span>
                <span className="font-medium text-foreground">pt-BR</span>
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
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm sm:col-span-2">
                <label className="flex items-center gap-2 text-foreground-muted">
                  <Shield size={16} />
                  Limiar mínimo (0-1)
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
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-[var(--color-on-primary)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar preferências"}
              </button>
            </div>
          </SettingsCard>
        </div>

        <div className="space-y-5 xl:space-y-6">
          <SettingsCard
            icon={Database}
            title="Seus dados"
            description="Seus lançamentos pertencem a você e podem ser baixados."
          >
              {hasExportableData ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-surface-2 p-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Exportar despesas
                    </h3>
                    <p className="mt-1 text-xs text-foreground-subtle">
                      CSV com Data, Descrição, Valor, Categoria e Subcategoria.
                      Período: todos os registros disponíveis.
                    </p>
                    <button
                      onClick={handleExportExpenses}
                      disabled={isExportingExpenses || !hasExpenses}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-[var(--color-on-primary)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Download size={16} />
                      {isExportingExpenses
                        ? "Preparando CSV..."
                        : hasExpenses
                          ? "Baixar CSV"
                          : "Sem despesas registradas"}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface-2 p-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Exportar rendas
                    </h3>
                    <p className="mt-1 text-xs text-foreground-subtle">
                      CSV com Data, Descrição, Tipo e Valor. Período: todas as
                      rendas disponíveis.
                    </p>
                    <button
                      onClick={handleExportIncomes}
                      disabled={isExportingIncomes || !hasIncomes}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Download size={16} />
                      {isExportingIncomes
                        ? "Preparando CSV..."
                        : hasIncomes
                          ? "Baixar CSV de rendas"
                          : "Sem rendas registradas"}
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Database}
                  title="Sem dados para exportar"
                  description="Registre sua primeira renda ou despesa para baixar um CSV com seus lançamentos financeiros."
                  primaryAction={{
                    label: "Ir para o dashboard",
                    href: "/dashboard",
                }}
                compact
              />
            )}
          </SettingsCard>

          <SettingsCard
            icon={MessageCircle}
            title="WhatsApp"
            description="Prepare o registro rápido de pequenos gastos por mensagem."
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      Integração em desenvolvimento
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-foreground-subtle">
                      Esta etapa prepara a conexão. O envio real pelo WhatsApp
                      ainda não está disponível via Meta ou Twilio.
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Em desenvolvimento
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground-subtle">
                      Status
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          whatsAppStatus?.connected
                            ? "bg-success/10 text-success"
                            : "bg-surface-3 text-foreground-muted"
                        }`}
                      >
                        {whatsAppStatus?.connected
                          ? "Conectado"
                          : "Desconectado"}
                      </span>
                      {whatsAppStatus?.phoneNumber && (
                        <span className="text-xs font-medium text-foreground-muted">
                          {whatsAppStatus.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:min-w-44">
                    <button
                      onClick={handleGenerateWhatsAppCode}
                      disabled={isGeneratingWhatsAppCode}
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-[var(--color-on-primary)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isGeneratingWhatsAppCode
                        ? "Gerando..."
                        : "Gerar código de conexão"}
                    </button>
                    {whatsAppStatus?.connected && (
                      <button
                        onClick={handleDisconnectWhatsApp}
                        disabled={isDisconnectingWhatsApp}
                        className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground-muted transition hover:bg-surface-3 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDisconnectingWhatsApp
                          ? "Desconectando..."
                          : "Desconectar WhatsApp"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {whatsAppLinkCode && (
                <div className="rounded-2xl border border-primary/24 bg-primary/8 p-4">
                  <p className="text-xs font-medium text-primary">
                    Código de conexão
                  </p>
                  <div className="mt-2 rounded-xl border border-primary/20 bg-surface px-4 py-3 font-mono text-lg font-medium text-foreground">
                    {whatsAppLinkCode.code}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-foreground-muted">
                    Expira em{" "}
                    {new Date(whatsAppLinkCode.expiresAt).toLocaleString(
                      "pt-BR",
                    )}
                    . No futuro, envie este código para o WhatsApp do Salgadin
                    para conectar sua conta.
                  </p>
                </div>
              )}

              {whatsAppError && (
                <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {whatsAppError}
                </div>
              )}
              {whatsAppMessage && (
                <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                  {whatsAppMessage}
                </div>
              )}

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-foreground">
                    Experiência planejada
                  </h3>
                  <p className="text-xs leading-5 text-foreground-subtle">
                    No futuro, você poderá registrar gastos por mensagem usando
                    comandos simples como estes.
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Adicionar 50 em almoço",
                    "Gastei 25 com Uber",
                    "Paguei 120 no mercado",
                    "Resumo de hoje",
                  ].map((command) => (
                    <span
                      key={command}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-xs text-foreground-muted"
                    >
                      {command}
                    </span>
                  ))}
                </div>
              </div>

              {isWhatsAppSimulatorEnabled && (
                <div className="rounded-2xl border border-dashed border-border bg-surface-2/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground-subtle">
                        Ferramentas de desenvolvimento
                      </p>
                      <p className="mt-1 text-xs leading-5 text-foreground-muted">
                        Área interna para validar o parser e o fluxo de
                        mensagens simuladas. Não faz parte da experiência
                        pública do WhatsApp.
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-danger/20 bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                      Restrito
                    </span>
                  </div>
                  <div className="mt-4">
                    <WhatsAppSimulationPanel />
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-foreground">
              Alertas e notificações
            </h2>
            <p className="text-sm text-foreground-muted">
              {unreadNotifications > 0
                ? `${unreadNotifications} notificacao(oes) não lida(s).`
                : "Tudo lido por aqui."}
            </p>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={isNotifying || notifications.length === 0}
            className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-medium text-foreground-muted transition hover:bg-surface-3 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isNotifying ? "Atualizando..." : "Marcar tudo como lido"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-medium text-foreground">
              Alertas do mês
            </h3>
            {alerts.length > 0 ? (
              <div className="mt-3 space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.goalId}
                    className="rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="text-sm font-medium text-foreground">
                      {alert.category || "Meta geral"}
                    </div>
                    <div className="mt-1 text-xs text-foreground-subtle">
                      R$ {alert.spent.toFixed(2)} de R${" "}
                      {alert.monthlyLimit.toFixed(2)}
                    </div>
                    <div
                      className={`mt-2 text-xs font-medium ${
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
                title="Nenhum alerta neste mês"
                description="Crie metas para receber avisos quando os pequenos gastos se aproximarem do limite."
                primaryAction={{ label: "Criar meta", href: "/metas" }}
                compact
                className="mt-3"
              />
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-medium text-foreground">
              Notificações automáticas
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
                        <span className="text-sm font-medium text-foreground">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                            Novo
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-foreground-subtle">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-foreground-muted">
                        {new Date(notification.createdAt).toLocaleString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-medium text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
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
                title="Sem notificações ainda"
                description="Quando uma meta ou alerta precisar da sua atenção, ele aparece aqui."
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
