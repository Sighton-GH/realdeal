import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { cn } from "@/lib/cn";
import { ToastProvider } from "@/components/ui";
import { AppColumn } from "./AppColumn";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { TopBarContext, type TopBarConfig } from "./TopBarContext";

const HIDE_NAV = [/^\/check\/[^/]+\/?$/, /^\/scan(?:\/|$)/];

export function AppShell() {
  const { pathname } = useLocation();
  const [topBar, setTopBar] = useState<TopBarConfig>({});
  const hideNav = HIDE_NAV.some((route) => route.test(pathname));

  return (
    <TopBarContext.Provider value={setTopBar}>
      <ToastProvider>
        <AppColumn>
          {!topBar.hidden && <TopBar title={topBar.title} back={topBar.back} right={topBar.right} />}
          <main className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", !hideNav && "pb-6")}>
            <Outlet />
          </main>
          {!hideNav && <BottomNav />}
        </AppColumn>
      </ToastProvider>
    </TopBarContext.Provider>
  );
}
