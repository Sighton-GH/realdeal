// PLACEHOLDER (SPEC-00). SCR-05 + SCR-06 replace.
import { useParams } from "react-router";
import { useTopBar } from "@/components/layout";
import { Placeholder } from "../Placeholder";

export function PriceEntryPage() {
  const { itemId } = useParams();
  useTopBar({ back: true, title: "Check a price" });
  return <Placeholder name={`Price entry: ${itemId}`} spec="SCR-05 and SCR-06" />;
}
