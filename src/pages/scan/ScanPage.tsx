// PLACEHOLDER (SPEC-00). SCR-13, SCR-14, SCR-15 replace.
import { useTopBar } from "@/components/layout";
import { Placeholder } from "../Placeholder";

export function ScanPage() {
  useTopBar({ back: true, title: "Scan a price tag" });
  return <Placeholder name="Camera scan" spec="SCR-13 to SCR-15" />;
}
