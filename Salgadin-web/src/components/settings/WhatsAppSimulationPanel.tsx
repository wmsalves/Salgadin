import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Send,
  Terminal,
} from "lucide-react";
import {
  simulateWhatsAppMessage,
  type WhatsAppSimulationRequest,
} from "../../services/whatsAppService";

const exampleMessages = [
  "Adicionar 50 em almoço",
  "Gastei 25 com Uber",
  "Paguei 120 no mercado",
  "Mercado 89,90",
];

function createMessageId() {
  return `dev-${Date.now()}`;
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response
  ) {
    const response = error.response as {
      status?: number;
      data?: { reply?: string; message?: string };
    };

    if (response.status === 403) {
      return "Seu usuário não está autorizado a usar o simulador WhatsApp neste ambiente.";
    }

    if (response.status === 404) {
      return "O endpoint de simulação não está habilitado neste ambiente.";
    }

    if (response.status === 401) {
      return "Faça login para usar o simulador WhatsApp neste ambiente.";
    }

    return response.data?.reply ?? response.data?.message;
  }

  return undefined;
}

export function WhatsAppSimulationPanel() {
  const initialMessageId = useMemo(() => createMessageId(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<WhatsAppSimulationRequest>({
    from: "+5531999999999",
    messageId: initialMessageId,
    text: "Adicionar 50 em almoço",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (field: keyof WhatsAppSimulationRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setReply(null);
    setErrorMessage(null);

    try {
      const response = await simulateWhatsAppMessage(form);
      setReply(response.reply);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error) ??
          "Não foi possível simular a mensagem. Verifique se o telefone está vinculado e se o endpoint dev está habilitado.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_24px_rgba(60,42,32,0.06)]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="whatsapp-simulator-panel"
        className="flex w-full flex-col gap-3 px-4 py-4 text-left transition hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-primary/25 sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-primary">
            <Terminal size={17} />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Simulador WhatsApp
              </span>
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-danger">
                Dev only
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Simulação local
              </span>
            </span>
            <span className="mt-1 block max-w-xl text-xs leading-5 text-foreground-subtle">
              Painel técnico para testar parser, telefone vinculado e
              idempotência. Ele não envia mensagens reais pelo WhatsApp.
            </span>
          </span>
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted">
          {isOpen ? "Ocultar" : "Abrir"}
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          id="whatsapp-simulator-panel"
          className="border-t border-border/70 bg-surface-2/45 p-4"
        >
          <div className="rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-xs leading-5 text-foreground-muted">
            Use esta ferramenta apenas para simular o fluxo interno. Em
            staging/produção, o backend ainda valida autenticação e e-mail
            autorizado.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-foreground-muted">
              Telefone/remetente
              <input
                value={form.from}
                onChange={(event) => updateField("from", event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="text-xs font-medium text-foreground-muted">
              Message ID
              <div className="mt-2 flex gap-2">
                <input
                  value={form.messageId}
                  onChange={(event) =>
                    updateField("messageId", event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => updateField("messageId", createMessageId())}
                  aria-label="Gerar novo Message ID"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-3 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </label>

            <label className="text-xs font-medium text-foreground-muted sm:col-span-2">
              Mensagem
              <textarea
                value={form.text}
                onChange={(event) => updateField("text", event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-foreground-muted">
              Exemplos rápidos
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {exampleMessages.map((message) => (
                <button
                  key={message}
                  type="button"
                  onClick={() => updateField("text", message)}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-foreground-muted transition hover:border-primary/30 hover:bg-primary/8 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={16} />
            {isSubmitting ? "Simulando..." : "Simular mensagem"}
          </button>

          {reply && (
            <div className="mt-4 rounded-2xl border border-success/25 bg-surface px-4 py-3 text-sm text-foreground">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-success">
                <CheckCircle2 size={14} />
                Resposta simulada
              </div>
              <div className="rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-xs leading-5 text-foreground-muted">
                {reply}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <AlertTriangle size={15} />
                Não foi possível simular
              </div>
              <p className="text-xs leading-5">{errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
