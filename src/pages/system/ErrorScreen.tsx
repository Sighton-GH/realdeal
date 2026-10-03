// PLACEHOLDER (SPEC-00). SCR-17 replaces; keep the props.
import { AppColumn } from "@/components/layout";
import { Button } from "@/components/ui";

export function ErrorScreen({ error }: { error?: unknown }) {
  return (
    <AppColumn>
      <div className="flex flex-col items-center gap-4 p-10 text-center">
        <h1 className="font-display text-h1 font-bold">Something broke</h1>
        <p className="text-ink-soft">RealDeal hit an unexpected error. Reload to try again.</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
        {import.meta.env.DEV && error instanceof Error && <pre className="whitespace-pre-wrap rounded-sm bg-sunken p-3 text-left text-micro">{error.message}</pre>}
      </div>
    </AppColumn>
  );
}
