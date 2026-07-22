<!-- <script lang="ts" module>
	import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
	import SendIcon from "@lucide/svelte/icons/send";
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import Tv from "@lucide/svelte/icons/tv";
	import Clapperboard from "@lucide/svelte/icons/clapperboard";
	import Videotape from "@lucide/svelte/icons/videotape";
	import { authState } from "$lib/features/auth/store.svelte";

	const data = {
		user: {
			name: authState.user?.name || "",
			email: authState.user?.email || "",
			avatar: authState.user?.picture || "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Masterclass",
				url: "/masterclass",
				icon: Clapperboard,
				isActive: true,
				// items: [
				// 	{
				// 		title: "History",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Starred",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Settings",
				// 		url: "#",
				// 	},
				// ],
			},
			{
				title: "Live",
				url: "/lives",
				icon: Tv,
				isActive: true,
			},
			{
				title: "Replay Live",
				url: "#",
				icon: Videotape,
				isActive: true,
			},
		],
		navSecondary: [
			{
				title: "Support",
				url: "#",
				icon: LifeBuoyIcon,
			},
		],
		admin: [
			{
				name: "Configuration Live",
				url: "/admin/lives",
				icon: Tv,
			},
			{
				name: "Configuration Collections",
				url: "/admin/collections",
				icon: Tv,
			},
		],
	};
</script>

<script lang="ts">
	import NavMain from "./nav-main.svelte";
	import NavProjects from "./nav-projects.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import CommandIcon from "@lucide/svelte/icons/command";
	import type { ComponentProps } from "svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="floating" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">Hacker son futur</span>
								<span class="truncate text-xs">Franck Lahoui</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		{#if authState.user?.role === 'admin'}
			<NavProjects projects={data.admin} />
		{/if}
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root> -->


<script lang="ts" module>
	import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
	import SendIcon from "@lucide/svelte/icons/send";
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import Tv from "@lucide/svelte/icons/tv";
	import Clapperboard from "@lucide/svelte/icons/clapperboard";
	import Videotape from "@lucide/svelte/icons/videotape";
	import { authState } from "$lib/features/auth/store.svelte";

	const data = {
		user: {
			name: authState.user?.name || "",
			email: authState.user?.email || "",
			avatar: authState.user?.picture || "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Masterclass",
				url: "/masterclass",
				icon: Clapperboard,
				isActive: true,
			},
			{
				title: "Live",
				url: "/lives",
				icon: Tv,
				isActive: true,
			},
			{
				title: "Replay Live",
				url: "#",
				icon: Videotape,
				isActive: true,
			},
		],
		navSecondary: [
			{
				title: "Support",
				url: "#",
				icon: LifeBuoyIcon,
			},
		],
		admin: [
			{
				name: "Configuration Live",
				url: "/admin/lives",
				icon: Tv,
			},
			{
				name: "Configuration Collections",
				url: "/admin/collections",
				icon: Tv,
			},
		],
	};
</script>

<script lang="ts">
	import NavMain from "./nav-main.svelte";
	import NavProjects from "./nav-projects.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<!--
	Le wrapper porte les variables de thème shadcn (--sidebar-*) réécrites avec
	notre palette éditoriale — Sidebar.Root et tous ses enfants (NavMain, NavUser...)
	les lisent en cascade, sans avoir besoin de toucher à leur code interne.
-->
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
			<NavMain items={data.navMain} />
			{#if authState.user?.role === 'admin'}
				<NavProjects projects={data.admin} />
			{/if}
			<NavSecondary items={data.navSecondary} class="mt-auto" />
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser user={data.user} />
		</Sidebar.Footer>
	</Sidebar.Root>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.sidebar-theme {
		/* Variables de thème lues par les composants shadcn Sidebar.* en cascade */
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

	/* La variante "sidebar" de shadcn reste flush par défaut, mais garde parfois
	   un radius sur les menu-buttons — on l'aplatit pour rester cohérent avec
	   le reste de l'app (angles droits partout). */
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

	/* Bloc de marque en haut, dans l'esprit du wordmark Fraunces de la navbar */
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