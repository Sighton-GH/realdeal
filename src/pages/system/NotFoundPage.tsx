// PLACEHOLDER (SPEC-00). SCR-17 replaces.
import { EmptyState, LinkButton } from "@/components/ui";

export function NotFoundPage() {
  return <EmptyState mood="meh" title="This aisle doesn't exist" body="The page you're looking for isn't here." action={<LinkButton to="/check">Back to Check</LinkButton>} />;
}
