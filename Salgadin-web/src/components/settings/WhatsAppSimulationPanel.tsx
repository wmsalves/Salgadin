import { useMemo, useState } from "react";
import { AlertTriangle, MessageCircle, Send } from "lucide-react";
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

    return response.data?.reply ?? response.data?.message;
  }

  return undefined;
}

export function WhatsAppSimulationPanel() {
  const initialMessageId = useMemo(() => createMessageId(), []);
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
    <div className="rounded-2xl border border-dashed border-primary/30 bg-surface/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Simulador WhatsApp
            </h3>
            <span className="rounded-full bg-danger/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-danger">
              Dev only
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              Simulação local
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-foreground-subtle">
            Este painel existe apenas para testar o parser e o fluxo interno.
            Ele não envia mensagens reais pelo WhatsApp e não integra Meta/Twilio.
          </p>
        </div>
        <AlertTriangle className="hidden text-primary sm:block" size={20} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
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
              onChange={(event) => updateField("messageId", event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => updateField("messageId", createMessageId())}
              className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
            >
              Novo
            </button>
          </div>
        </label>

        <label className="text-xs font-medium text-foreground-muted">
          Mensagem
          <textarea
            value={form.text}
            onChange={(event) => updateField("text", event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {exampleMessages.map((message) => (
          <button
            key={message}
            type="button"
            onClick={() => updateField("text", message)}
            className="rounded-full border border-border bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-foreground-muted transition hover:bg-surface-3 hover:text-foreground"
          >
            {message}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Send size={16} />
        {isSubmitting ? "Simulando..." : "Simular mensagem"}
      </button>

      {reply && (
        <div className="mt-4 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <MessageCircle size={15} />
            Resposta simulada
          </div>
          {reply}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
