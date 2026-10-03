// FROZEN (SPEC-00).
import { Route, Routes } from "react-router";
import { AppShell } from "@/components/layout";
import { LandingPage } from "@/pages/landing/LandingPage";
import { CheckHomePage } from "@/pages/check/CheckHomePage";
import { PriceEntryPage } from "@/pages/check/PriceEntryPage";
import { RevealPage } from "@/pages/reveal/RevealPage";
import { ItemDetailPage } from "@/pages/item/ItemDetailPage";
import { ScanPage } from "@/pages/scan/ScanPage";
import { TricksPage } from "@/pages/tricks/TricksPage";
import { NotFoundPage } from "@/pages/system/NotFoundPage";
import { UiPlayground } from "@/pages/dev/UiPlayground";
import { PennyPlayground } from "@/pages/dev/PennyPlayground";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/reveal/:checkId" element={<RevealPage />} />
      <Route element={<AppShell />}>
        <Route path="/check" element={<CheckHomePage />} />
        <Route path="/check/:itemId" element={<PriceEntryPage />} />
        <Route path="/item/:itemId" element={<ItemDetailPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/tricks" element={<TricksPage />} />
        {import.meta.env.DEV && <Route path="/dev/ui" element={<UiPlayground />} />}
        {import.meta.env.DEV && <Route path="/dev/penny" element={<PennyPlayground />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
