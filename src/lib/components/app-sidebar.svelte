<!-- 


<script lang="ts" module>
	import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
	import Signal from "@lucide/svelte/icons/signal";
	import Webcam from "@lucide/svelte/icons/webcam";
	import Library from "@lucide/svelte/icons/library";
	import LibraryIcon from "@lucide/svelte/icons/library";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import UserRound from "@lucide/svelte/icons/user-round";
	import Logo from "$lib/assets/logo.jpeg"
	import UsersRound from "@lucide/svelte/icons/users-round";

	const navSecondary = [
		{ title: "Support", url: "#", icon: LifeBuoyIcon },
	];

	const admin = [
		{ name: "Configuration Live", url: "/admin/lives", icon: Signal },
		{ name: "Configuration Collections", url: "/admin/collections", icon: Library },
		{ name: "Membres", url: "/admin/members", icon: UserRound },
	];
</script>

<script lang="ts">
	import NavMain from "./nav-main.svelte";
	import NavProjects from "./nav-projects.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { page } from "$app/state";
	import { unreadStore } from "$lib/features/messaging/unread.svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let user = $derived({
		name: page.data.user?.name || "",
		email: page.data.user?.email || "",
		avatar: page.data.user?.picture || "/avatars/shadcn.jpg",
	});

	let navMain = $derived([
		{ title: "Masterclass", url: "/masterclass", icon: LibraryIcon, isActive: true },
		{ title: "Live", url: "/lives", icon: Webcam, isActive: true },
		{ title: "Communauté", url: "/community/posts", icon: UsersRound, isActive: true },
		{ title: "Profil", url: "/profile", icon: UserRound, isActive: true },
		{ title: "Messages", url: "/messages", icon: MessageCircleIcon, isActive: true, showBadge: unreadStore.hasUnread },
	]);
</script>

<div class="sidebar-theme">
	<Sidebar.Root bind:ref variant="sidebar" collapsible="icon" {...restProps}>
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" class="sidebar-brand">
						{#snippet child({ props })}
							<a href="/masterclass" {...props}>
								<div class="sidebar-brand__mark">
									<img src={Logo} alt="Logo" class="w-full h-full object-cover" />
								</div>
								<div class="grid flex-1 text-start leading-tight">
									<span class="sidebar-brand__name">Hacker son futur</span>
									<span class="sidebar-brand__author">Franck Lahoui</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<NavMain items={navMain} />
			{#if page.data.user?.role === 'admin'}
				<NavProjects projects={admin} />
			{/if}
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser {user} />
		</Sidebar.Footer>
	</Sidebar.Root>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Tokens shadcn remappés sur la DA : noir et blanc, filets noirs.
	   accent = noir plein, donc hover/actif s'inversent (blanc sur noir). */
	.sidebar-theme {
		--sidebar: #ffffff;
		--sidebar-foreground: #000000;
		--sidebar-primary: #000000;
		--sidebar-primary-foreground: #ffffff;
		--sidebar-accent: #000000;
		--sidebar-accent-foreground: #ffffff;
		--sidebar-border: #000000;
		--sidebar-ring: #000000;

		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}

	.sidebar-theme :global([data-sidebar]),
	.sidebar-theme :global([data-slot^="sidebar"]) {
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	.sidebar-theme :global([data-sidebar="menu-button"]),
	.sidebar-theme :global([data-slot="sidebar-menu-button"]) {
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0;
	}

	/* Filets noirs qui séparent l'en-tête, le contenu et le pied */
	.sidebar-theme :global([data-sidebar="header"]),
	.sidebar-theme :global([data-slot="sidebar-header"]) {
		border-bottom: 1px solid var(--sidebar-border);
	}
	.sidebar-theme :global([data-sidebar="footer"]),
	.sidebar-theme :global([data-slot="sidebar-footer"]) {
		border-top: 1px solid var(--sidebar-border);
	}

	:global(.sidebar-brand) {
		height: auto !important;
		padding: 0.5rem 0 !important;
	}
	/* La marque ne s'inverse pas au survol : c'est un logo, pas une entrée de menu */
	:global(.sidebar-brand:hover),
	:global(.sidebar-brand:active) {
		background: transparent !important;
		color: var(--sidebar-foreground) !important;
	}

	.sidebar-brand__mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		overflow: hidden;
		border: 1px solid var(--sidebar-border);
		color: var(--sidebar-foreground);
	}

	.sidebar-brand__name {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: 0.98rem;
		letter-spacing: -0.03em;
		color: var(--sidebar-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-brand__author {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6a6a6a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style> -->

<script lang="ts" module>
	import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
	import Signal from "@lucide/svelte/icons/signal";
	import Webcam from "@lucide/svelte/icons/webcam";
	import Library from "@lucide/svelte/icons/library";
	import LibraryIcon from "@lucide/svelte/icons/library";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import UserRound from "@lucide/svelte/icons/user-round";
	import Logo from "$lib/assets/logo.jpeg"
	import UsersRound from "@lucide/svelte/icons/users-round";

	const navSecondary = [
		{ title: "Support", url: "#", icon: LifeBuoyIcon },
	];

	const admin = [
		{ name: "Configuration Live", url: "/admin/lives", icon: Signal },
		{ name: "Configuration Collections", url: "/admin/collections", icon: Library },
		{ name: "Membres", url: "/admin/members", icon: UserRound },
	];
</script>

<script lang="ts">
	import NavMain from "./nav-main.svelte";
	import NavProjects from "./nav-projects.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { page } from "$app/state";
	import { unreadStore } from "$lib/features/messaging/unread.svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let user = $derived({
		name: page.data.user?.name || "",
		email: page.data.user?.email || "",
		avatar: page.data.user?.picture || "/avatars/shadcn.jpg",
	});

	let navMain = $derived([
		{ title: "Masterclass", url: "/masterclass", icon: LibraryIcon, isActive: true },
		{ title: "Live", url: "/lives", icon: Webcam, isActive: true },
		{ title: "Communauté", url: "/community/posts", icon: UsersRound, isActive: true },
		{ title: "Profil", url: "/profile", icon: UserRound, isActive: true },
		{ title: "Messages", url: "/messages", icon: MessageCircleIcon, isActive: true, showBadge: unreadStore.hasUnread },
	]);
</script>

<div class="sidebar-theme">
	<Sidebar.Root bind:ref variant="sidebar" collapsible="icon" {...restProps}>
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" class="sidebar-brand">
						{#snippet child({ props })}
							<a href="/masterclass" {...props}>
								<div class="sidebar-brand__mark">
									<img src={Logo} alt="Logo" class="w-full h-full object-cover" />
								</div>
								<div class="grid flex-1 text-start leading-tight">
									<span class="sidebar-brand__name">Hacker son futur</span>
									<span class="sidebar-brand__author">Franck Lahoui</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<NavMain items={navMain} />
			{#if page.data.user?.role === 'admin'}
				<NavProjects projects={admin} />
			{/if}
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser {user} />
		</Sidebar.Footer>
	</Sidebar.Root>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Tokens shadcn remappés sur la DA : noir et blanc, filets noirs.
	   accent = noir plein, donc hover/actif s'inversent (blanc sur noir). */
	.sidebar-theme {
		--sidebar: #ffffff;
		--sidebar-foreground: #000000;
		--sidebar-primary: #000000;
		--sidebar-primary-foreground: #ffffff;
		--sidebar-accent: #000000;
		--sidebar-accent-foreground: #ffffff;
		--sidebar-border: #000000;
		--sidebar-ring: #000000;

		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}

	.sidebar-theme :global([data-sidebar]),
	.sidebar-theme :global([data-slot^="sidebar"]) {
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	.sidebar-theme :global([data-sidebar="menu-button"]),
	.sidebar-theme :global([data-slot="sidebar-menu-button"]) {
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0;
	}

	/* Filets noirs qui séparent l'en-tête, le contenu et le pied */
	.sidebar-theme :global([data-sidebar="header"]),
	.sidebar-theme :global([data-slot="sidebar-header"]) {
		box-sizing: border-box;
		height: var(--header-height, 4rem);
		padding-top: 0;
		padding-bottom: 0;
		justify-content: center;
		border-bottom: 1px solid var(--sidebar-border);
	}
	.sidebar-theme :global([data-sidebar="footer"]),
	.sidebar-theme :global([data-slot="sidebar-footer"]) {
		border-top: 1px solid var(--sidebar-border);
	}

	:global(.sidebar-brand) {
		height: auto !important;
		padding: 0.5rem 0 !important;
	}
	/* La marque ne s'inverse pas au survol : c'est un logo, pas une entrée de menu */
	:global(.sidebar-brand:hover),
	:global(.sidebar-brand:active) {
		background: transparent !important;
		color: var(--sidebar-foreground) !important;
	}

	.sidebar-brand__mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		overflow: hidden;
		border: 1px solid var(--sidebar-border);
		color: var(--sidebar-foreground);
	}

	.sidebar-brand__name {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: 0.98rem;
		letter-spacing: -0.03em;
		color: var(--sidebar-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-brand__author {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6a6a6a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>