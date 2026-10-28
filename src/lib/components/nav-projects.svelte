<!-- <script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from "$app/state";

	let {
		projects,
	}: {
		projects: {
			name: string;
			url: string;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon: any;
		}[];
	} = $props();

	function isItemActive(url: string) {
		if (url === "#") return false;
		return page.url.pathname === url || page.url.pathname.startsWith(`${url}/`);
	}
</script>

<Sidebar.Group class="nav-projects group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each projects as item (item.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={isItemActive(item.url)}>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.name}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	:global(.nav-projects [data-sidebar="group-label"]),
	:global(.nav-projects [data-slot="sidebar-group-label"]) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #77746c;
	}

	:global(.nav-projects [data-sidebar="menu-button"]),
	:global(.nav-projects [data-slot="sidebar-menu-button"]) {
		border-radius: 0 !important;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
	}

	:global(.nav-projects [data-sidebar="menu-button"][data-active="true"]),
	:global(.nav-projects [data-slot="sidebar-menu-button"][data-active="true"]) {
		font-weight: 500;
	}
</style> -->


<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { page } from "$app/state";

	let {
		projects,
	}: {
		projects: {
			name: string;
			url: string;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon: any;
		}[];
	} = $props();

	function isItemActive(url: string) {
		if (url === "#") return false;
		return page.url.pathname === url || page.url.pathname.startsWith(`${url}/`);
	}
</script>

<Sidebar.Group class="nav-projects group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each projects as item (item.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={isItemActive(item.url)}>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.name}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Même traitement que nav-main : label sobre, entrées à bordure au survol,
	   noir plein quand actif */
	:global(.nav-projects [data-sidebar="group-label"]),
	:global(.nav-projects [data-slot="sidebar-group-label"]) {
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
		color: #6a6a6a;
		opacity: 1;
	}

	:global(.nav-projects [data-sidebar="menu-button"]),
	:global(.nav-projects [data-slot="sidebar-menu-button"]) {
		border-radius: 0 !important;
		border: 1px solid transparent;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
	}

	:global(.nav-projects [data-sidebar="menu-button"]:hover:not([data-active="true"])),
	:global(.nav-projects [data-slot="sidebar-menu-button"]:hover:not([data-active="true"])) {
		background: transparent !important;
		color: #000 !important;
		border-color: #000;
	}

	:global(.nav-projects [data-sidebar="menu-button"][data-active="true"]),
	:global(.nav-projects [data-slot="sidebar-menu-button"][data-active="true"]) {
		background: #000 !important;
		color: #fff !important;
		border-color: #000;
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.nav-projects [data-sidebar="menu-button"]),
		:global(.nav-projects [data-slot="sidebar-menu-button"]) {
			transition: none;
		}
	}
</style>