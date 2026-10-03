// STUB (SPEC-00). SCR-04 replaces; props are final.
import { useQuery } from "@tanstack/react-query";
import { Clock } from "@phosphor-icons/react";
import { api } from "@/api/client";
import { formatRelativeTime } from "@/lib/format";

export function DataFreshness({ compact, className }: { compact?: boolean; className?: string }) {
  const q = useQuery({ queryKey: ["status"], queryFn: () => api.getDataStatus() });
  if (!q.data) return null;
  return (
    <p className={`flex items-center gap-1.5 text-small text-ink-soft ${compact ? "" : "py-2"} ${className ?? ""}`}>
      <Clock size={16} weight="bold" /> Prices updated {formatRelativeTime(q.data.updatedAt)}
    </p>
  );
}
