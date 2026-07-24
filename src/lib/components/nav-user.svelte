<script lang="ts">
	import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
	import BellIcon from "@lucide/svelte/icons/bell";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import LogOutIcon from "@lucide/svelte/icons/log-out";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";

	let {
		user,
	}: {
		user: {
			name: string;
			email: string;
			avatar: string;
		};
	} = $props();

	const sidebar = useSidebar();

	function initials(name: string) {
		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') || '?';
	}
</script>

<Sidebar.Menu class="nav-user">
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar.Root class="nav-user__avatar size-8">
							<Avatar.Image src={user.avatar} alt={user.name} />
							<Avatar.Fallback class="nav-user__avatar-fallback">{initials(user.name)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="nav-user__menu w-(--bits-dropdown-menu-anchor-width) min-w-56"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="nav-user__avatar size-8">
							<Avatar.Image src={user.avatar} alt={user.name} />
							<Avatar.Fallback class="nav-user__avatar-fallback">{initials(user.name)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<!-- <DropdownMenu.Group>
					<DropdownMenu.Item>
						<BadgeCheckIcon />
						Compte
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<CreditCardIcon />
						Facturation
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group> -->
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a href="/auth/logout" {...props}>
							<LogOutIcon />
							Déconnexion
						</a>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	:global(.nav-user [data-sidebar="menu-button"]),
	:global(.nav-user [data-slot="sidebar-menu-button"]) {
		border-radius: 0 !important;
		font-family: 'Inter', sans-serif;
	}

	/* Avatar carré au lieu du rounded-lg par défaut de shadcn */
	:global(.nav-user__avatar) {
		border-radius: 0 !important;
		border: 1px solid #e6e3db;
	}
	:global(.nav-user__avatar-fallback) {
		border-radius: 0 !important;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		background: #f8f7f3;
		color: #77746c;
	}

	/* Menu déroulant : hairline au lieu du radius/shadow par défaut */
	:global(.nav-user__menu) {
		border-radius: 0 !important;
		border-color: #e6e3db !important;
		font-family: 'Inter', sans-serif;
	}
</style>