import { useAuth } from "../hooks/useAuth";
import { Mail, User, Shield, Bell } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

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
                {user?.email || "usuario@email.com"}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Preferencias
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Bell size={16} />
                Alertas de gastos
              </div>
              <span className="text-xs font-semibold text-primary">Ativo</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Shield size={16} />
                Autenticacao em 2 etapas
              </div>
              <span className="text-xs font-semibold text-foreground-muted">
                Em breve
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
