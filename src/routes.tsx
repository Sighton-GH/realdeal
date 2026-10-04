// FROZEN (SPEC-00).
import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "@/components/layout";
import { StoresPage } from "@/pages/stores/StoresPage";
import { StoreDetailPage } from "@/pages/stores/StoreDetailPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { AboutPage } from "@/pages/about/AboutPage";
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
      <Route path="/" element={<Navigate to="/check" replace />} />
      <Route path="/reveal/:checkId" element={<RevealPage />} />
      <Route element={<AppShell />}>
        <Route path="/check" element={<CheckHomePage />} />
        <Route path="/check/:itemId" element={<PriceEntryPage />} />
        <Route path="/item/:itemId" element={<ItemDetailPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/tricks" element={<TricksPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:retailerId" element={<StoreDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        {import.meta.env.DEV && <Route path="/dev/ui" element={<UiPlayground />} />}
        {import.meta.env.DEV && <Route path="/dev/penny" element={<PennyPlayground />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
