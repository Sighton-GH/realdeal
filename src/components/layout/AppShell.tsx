// STUB (SPEC-00). UI-07 replaces; behaviour is final.
import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ToastProvider } from "@/components/ui";
import { AppColumn } from "./AppColumn";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { TopBarContext, type TopBarConfig } from "./TopBarContext";

const HIDE_NAV = [/^\/check\/[^/]+$/, /^\/scan/];

export function AppShell() {
  const { pathname } = useLocation();
  const [topBar, setTopBar] = useState<TopBarConfig>({});
  const hideNav = HIDE_NAV.some((r) => r.test(pathname));
  return (
    <TopBarContext.Provider value={setTopBar}>
      <ToastProvider>
        <AppColumn>
          {!topBar.hidden && <TopBar title={topBar.title} back={topBar.back} right={topBar.right} />}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          {!hideNav && <BottomNav />}
        </AppColumn>
      </ToastProvider>
    </TopBarContext.Provider>
  );
}
