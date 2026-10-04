import { ItemArt } from "@/components/art";
import { useTopBar } from "@/components/layout";
import { EmptyState, LinkButton } from "@/components/ui";

export function NotFoundPage() {
  useTopBar({});

  return (
    <section className="flex min-h-full flex-col items-center justify-center px-5 py-8">
      <EmptyState
        mood="meh"
        title="This aisle doesn't exist"
        body="The page you're looking for isn't here."
        action={<LinkButton to="/check">Back to Check</LinkButton>}
        className="w-full py-0"
      />
      <div aria-hidden="true" className="mt-7 flex items-end justify-center gap-3">
        <ItemArt artKey="milk" size={40} className="-rotate-12" />
        <ItemArt artKey="bread" size={40} className="rotate-6" />
        <ItemArt artKey="banana" size={40} className="rotate-12" />
      </div>
    </section>
  );
}
