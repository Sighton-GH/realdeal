import { AppColumn } from "@/components/layout";
import { Penny } from "@/components/penny";
import { Button, buttonClass } from "@/components/ui";

function errorDetails(error: unknown): string {
  try {
    if (error instanceof Error) {
      return [error.message, error.stack].filter(Boolean).join("\n\n");
    }
    if (error === undefined) return "No error details were provided.";
    if (typeof error === "string") return error;
    return JSON.stringify(error, null, 2) ?? String(error);
  } catch {
    return "Error details could not be displayed.";
  }
}

export function ErrorScreen({ error }: { error?: unknown }) {
  return (
    <AppColumn>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-10">
        <div className="my-auto flex w-full shrink-0 flex-col items-center gap-7 text-center">
          <Penny mood="sad" size={140} />
          <div className="flex w-full flex-col items-center gap-3">
            <h1 className="font-display text-h1 font-bold text-ink">Something broke</h1>
            <p className="max-w-[36ch] text-body text-ink-soft">
              RealDeal hit an unexpected error. Reload to try again.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4">
            <Button fullWidth onClick={() => window.location.reload()}>Reload</Button>
            <a href="/check" className={buttonClass({ variant: "secondary", size: "md", fullWidth: true })}>
              Back to Check
            </a>
          </div>
          {import.meta.env.DEV && (
            <pre
              aria-label="Error details"
              tabIndex={0}
              className="max-h-48 w-full overflow-auto whitespace-pre-wrap break-words rounded-sm bg-sunken p-4 text-left font-body text-micro text-ink-soft"
            >
              {errorDetails(error)}
            </pre>
          )}
        </div>
      </main>
    </AppColumn>
  );
}
