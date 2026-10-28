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
							<span class="nav-user__name truncate">{user.name}</span>
							<span class="nav-user__email truncate text-xs">{user.email}</span>
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
							<span class="nav-user__name truncate">{user.name}</span>
							<span class="nav-user__email truncate text-xs">{user.email}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<!-- <DropdownMenu.Item>
						<BadgeCheckIcon />
						Compte
					</DropdownMenu.Item> -->
					<DropdownMenu.Item>
						{#snippet child({ props })}
							<a href="/billing" {...props}>
								<CreditCardIcon />
								Facturation
							</a>
						{/snippet}
					</DropdownMenu.Item>
					<!-- <DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item> -->
				</DropdownMenu.Group>
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
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Bouton déclencheur : bordure au survol, noir plein quand le menu est ouvert,
	   comme les entrées de nav-main */
	:global(.nav-user [data-sidebar="menu-button"]),
	:global(.nav-user [data-slot="sidebar-menu-button"]) {
		border-radius: 0 !important;
		border: 1px solid transparent;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
	}
	:global(.nav-user [data-slot="sidebar-menu-button"]:hover:not([data-state="open"])) {
		background: transparent !important;
		color: #000 !important;
		border-color: #000;
	}
	:global(.nav-user [data-slot="sidebar-menu-button"][data-state="open"]) {
		background: #000 !important;
		color: #fff !important;
		border-color: #000;
	}

	.nav-user__name {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.nav-user__email {
		font-weight: 500;
		color: #6a6a6a;
	}
	:global(.nav-user [data-state="open"]) .nav-user__email {
		color: #d0d0d0;
	}

	/* Avatar carré à bordure noire, initiales en Bricolage */
	:global(.nav-user__avatar) {
		border-radius: 0 !important;
		border: 1px solid #000;
	}
	:global(.nav-user__avatar-fallback) {
		border-radius: 0 !important;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 0.72rem;
		font-weight: 700;
		background: #fff;
		color: #000;
	}
	/* Sur le bouton ouvert (fond noir), l'avatar garde un contour blanc lisible */
	:global(.nav-user [data-state="open"] .nav-user__avatar) {
		border-color: #fff;
	}

	/* Menu déroulant (rendu dans un portail, donc couleurs en dur) :
	   filet noir, pas de radius ni d'ombre, entrées qui s'inversent */
	:global(.nav-user__menu) {
		border-radius: 0 !important;
		border: 1px solid #000 !important;
		box-shadow: none !important;
		background: #fff;
		color: #000;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}
	:global(.nav-user__menu .nav-user__email) {
		color: #6a6a6a;
	}
	:global(.nav-user__menu [data-slot="dropdown-menu-separator"]) {
		background: #000;
	}
	:global(.nav-user__menu [data-slot="dropdown-menu-item"]) {
		border-radius: 0 !important;
		font-size: 0.9rem;
		font-weight: 500;
	}
	:global(.nav-user__menu [data-slot="dropdown-menu-item"] svg) {
		color: currentColor !important;
	}
	:global(.nav-user__menu [data-slot="dropdown-menu-item"][data-highlighted]) {
		background: #000 !important;
		color: #fff !important;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.nav-user [data-sidebar="menu-button"]),
		:global(.nav-user [data-slot="sidebar-menu-button"]) {
			transition: none;
		}
	}
</style>