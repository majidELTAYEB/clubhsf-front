<script lang="ts" module>
	import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
	import Signal from "@lucide/svelte/icons/signal";
	import Webcam from "@lucide/svelte/icons/webcam";
	import Library from "@lucide/svelte/icons/library";
	import Clapperboard from "@lucide/svelte/icons/clapperboard";
	import Videotape from "@lucide/svelte/icons/videotape";

	const navMain = [
		{ title: "Masterclass", url: "/masterclass", icon: Clapperboard, isActive: true },
		{ title: "Live", url: "/lives", icon: Webcam, isActive: true },
		{ title: "Replay Live", url: "/livestreams-replays", icon: Videotape, isActive: true },
	];

	const navSecondary = [
		{ title: "Support", url: "#", icon: LifeBuoyIcon },
	];

	const admin = [
		{ name: "Configuration Live", url: "/admin/lives", icon: Signal },
		{ name: "Configuration Collections", url: "/admin/collections", icon: Library },
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

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	// `page.data` est scopé par requête/rendu — sûr en SSR concurrent,
	// contrairement à un store custom basé sur un `$state` de module.
	let user = $derived({
		name: page.data.user?.name || "",
		email: page.data.user?.email || "",
		avatar: page.data.user?.picture || "/avatars/shadcn.jpg",
	});
</script>

<div class="sidebar-theme">
	<Sidebar.Root bind:ref variant="sidebar" collapsible="icon" {...restProps}>
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" class="sidebar-brand">
						{#snippet child({ props })}
							<a href="/masterclass" {...props}>
								<div class="sidebar-brand__mark">HSF</div>
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
			<!-- <NavSecondary items={navSecondary} class="mt-auto" /> -->
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser {user} />
		</Sidebar.Footer>
	</Sidebar.Root>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.sidebar-theme {
		--sidebar: #ffffff;
		--sidebar-foreground: #121210;
		--sidebar-primary: #121210;
		--sidebar-primary-foreground: #ffffff;
		--sidebar-accent: #f8f7f3;
		--sidebar-accent-foreground: #121210;
		--sidebar-border: #e6e3db;
		--sidebar-ring: #b23a1f;

		font-family: 'Inter', sans-serif;
	}

	.sidebar-theme :global([data-sidebar]),
	.sidebar-theme :global([data-slot^="sidebar"]) {
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	.sidebar-theme :global([data-sidebar="menu-button"]),
	.sidebar-theme :global([data-slot="sidebar-menu-button"]) {
		font-size: 0.85rem;
		letter-spacing: 0.01em;
	}

	:global(.sidebar-brand) {
		height: auto !important;
		padding: 0.5rem 0 !important;
	}

	.sidebar-brand__mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border: 1px solid var(--sidebar-border);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--sidebar-foreground);
	}

	.sidebar-brand__name {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--sidebar-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-brand__author {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		color: #77746c;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>