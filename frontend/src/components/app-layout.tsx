import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { format } from "date-fns";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSessionRefresh } from "@/hooks/use-session-refresh";

const TITLES: Record<string, string> = {
	"/attendance": "Attendance",
	"/my-attendance": "My attendance",
	"/employees": "Employees",
	"/employees/new": "New employee",
	"/departments": "Departments",
	"/settings": "Settings",
};

export default function AppLayout() {
	const [today] = useState(() => new Date());
	const { pathname } = useLocation();
	const title =
		TITLES[pathname] ??
		(/^\/(?:my-)?attendance\/\d+$/.test(pathname)
			? "Attendance detail"
			: /^\/employees\/[^/]+\/edit$/.test(pathname)
				? "Edit employee"
				: /^\/employees\/[^/]+$/.test(pathname)
					? "Employee detail"
					: "");

	useSessionRefresh();

	return (
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mx-1 h-4" />
						<span className="text-sm font-medium">Workspace</span>
						<span className="text-sm text-muted-foreground">/</span>
						<span className="text-sm text-muted-foreground">{title}</span>
						<span className="ml-auto hidden text-sm text-muted-foreground sm:block">
							{format(today, "EEEE, MMMM d, yyyy")}
						</span>
					</header>

					<div className="flex min-w-0 flex-1 flex-col gap-6 bg-muted/30 p-4 md:p-6">
						<Outlet />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}
