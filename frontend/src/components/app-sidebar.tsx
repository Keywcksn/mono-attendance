import {
	CalendarCheck2,
	House,
	LogOut,
	Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { logout } from "@/api/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { getStoredUser, getInitials, formatRole } from "@/lib/user";

const navItems: {
	title: string;
	icon: typeof CalendarCheck2;
	href?: string;
	roles: string[];
}[] = [
	{
		title: "Attendance",
		icon: CalendarCheck2,
		href: "/attendance",
		roles: ["ADMIN"],
	},
	{
		title: "My attendance",
		icon: CalendarCheck2,
		href: "/my-attendance",
		roles: ["EMPLOYEE"],
	},
	{ title: "Employees", icon: Users, href: "/employees", roles: ["ADMIN"] },
	{
		title: "Departments",
		icon: House,
		href: "/departments",
		roles: ["ADMIN"],
	},
];

export function AppSidebar() {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	// Read after login: this component mounts inside the protected layout.
	const user = getStoredUser();
	const name = user?.fullName ?? "User";
	const role = user ? formatRole(user.role) : "";
	const visibleItems = navItems.filter(
		(item) => user && item.roles.includes(user.role),
	);

	async function handleLogout() {
		await logout();
		navigate("/login", { replace: true });
	}

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<CalendarCheck2 className="size-4" />
					</div>
					<div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
						<span className="truncate font-heading text-sm font-semibold">
							Mono.
						</span>
						<span className="mt-0.5 truncate text-xs text-muted-foreground">
							Attendance tracker
						</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Workspace</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{visibleItems.map((item) => {
								const href = item.href;
								const isActive =
									href !== undefined &&
									(pathname === href || pathname.startsWith(`${href}/`));

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											isActive={isActive}
											tooltip={item.title}
											aria-current={isActive ? "page" : undefined}
											onClick={href ? () => navigate(href) : undefined}
										>
											<item.icon />
											<span>{item.title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="xl" tooltip={name} className="border">
							<Avatar>
								<AvatarFallback className="bg-emerald-50 text-xs font-medium text-emerald-700">
									{getInitials(name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
								<span className="truncate text-sm font-medium">{name}</span>
								<span className="mt-1 truncate text-xs text-muted-foreground">
									{role}
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
              className="bg-primary text-primary-foreground rounded-md transition-all hover:bg-primary/80 hover:text-primary-foreground"
							tooltip="Log out"
							onClick={() => void handleLogout()}
						>
							<LogOut />
							<span>Log out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
