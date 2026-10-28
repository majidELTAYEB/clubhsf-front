<!-- <script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { page } from "$app/state";

	let {
		items,
	}: {
		items: {
			title: string;
			url: string;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon: any;
			isActive?: boolean;
			showBadge?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
		}[];
	} = $props();

	function isItemActive(url: string) {
		if (url === "#") return false;
		return page.url.pathname === url || page.url.pathname.startsWith(`${url}/`);
	}
</script>

<Sidebar.Group class="nav-main">
	<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as mainItem (mainItem.title)}
			{@const active = isItemActive(mainItem.url)}
			<Collapsible.Root open={active || mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props} class="nav-main__item">
						<Sidebar.MenuButton tooltipContent={mainItem.title} isActive={active}>
							{#snippet child({ props })}
								<a href={mainItem.url} {...props}>
									<mainItem.icon />
									<span>{mainItem.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if mainItem.showBadge}
							<span class="nav-main__dot" aria-label="Nouveaux messages"></span>
						{/if}
						{#if mainItem.items?.length}
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="data-[state=open]:rotate-90"
									>
										<ChevronRightIcon />
										<span class="sr-only">Toggle</span>
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton
												href={subItem.url}
												isActive={isItemActive(subItem.url)}
											>
												<span>{subItem.title}</span>
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						{/if}
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	:global(.nav-main [data-sidebar="group-label"]),
	:global(.nav-main [data-slot="sidebar-group-label"]) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #77746c;
		opacity: 1;
	}

	:global(.nav-main [data-sidebar="menu-button"]),
	:global(.nav-main [data-slot="sidebar-menu-button"]) {
		border-radius: 0 !important;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
	}

	:global(.nav-main [data-sidebar="menu-button"][data-active="true"]),
	:global(.nav-main [data-slot="sidebar-menu-button"][data-active="true"]) {
		font-weight: 500;
	}

	:global(.nav-main [data-sidebar="menu-sub"]),
	:global(.nav-main [data-slot="sidebar-menu-sub"]) {
		border-left: 1px solid #e6e3db;
		margin-left: 0.9rem;
	}

	:global(.nav-main [data-sidebar="menu-sub-button"]),
	:global(.nav-main [data-slot="sidebar-menu-sub-button"]) {
		border-radius: 0 !important;
		font-size: 0.8rem;
	}

	:global(.nav-main [data-sidebar="menu-action"]),
	:global(.nav-main [data-slot="sidebar-menu-action"]) {
		border-radius: 0 !important;
	}

	/* Pastille positionnée sur le MenuItem lui-même (pas sur l'icône), pour
	   ne jamais toucher à la structure interne du bouton shadcn-svelte. */
	:global(.nav-main__item) {
		position: relative;
	}
	.nav-main__dot {
		position: absolute;
		top: 0.45rem;
		left: 1.55rem;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: #e53e3e;
		pointer-events: none;
	}
</style> -->


<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { page } from "$app/state";

	let {
		items,
	}: {
		items: {
			title: string;
			url: string;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon: any;
			isActive?: boolean;
			showBadge?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
		}[];
	} = $props();

	function isItemActive(url: string) {
		if (url === "#") return false;
		return page.url.pathname === url || page.url.pathname.startsWith(`${url}/`);
	}
</script>

<Sidebar.Group class="nav-main">
	<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as mainItem (mainItem.title)}
			{@const active = isItemActive(mainItem.url)}
			<Collapsible.Root open={active || mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props} class="nav-main__item">
						<Sidebar.MenuButton tooltipContent={mainItem.title} isActive={active}>
							{#snippet child({ props })}
								<a href={mainItem.url} {...props}>
									<mainItem.icon />
									<span>{mainItem.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if mainItem.showBadge}
							<span class="nav-main__dot" aria-label="Nouveaux messages"></span>
						{/if}
						{#if mainItem.items?.length}
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction
										{...props}
										class="data-[state=open]:rotate-90"
									>
										<ChevronRightIcon />
										<span class="sr-only">Toggle</span>
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton
												href={subItem.url}
												isActive={isItemActive(subItem.url)}
											>
												<span>{subItem.title}</span>
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						{/if}
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Label de groupe : sobre, sans majuscules espacées */
	:global(.nav-main [data-sidebar="group-label"]),
	:global(.nav-main [data-slot="sidebar-group-label"]) {
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
		color: #6a6a6a;
		opacity: 1;
	}

	/* Entrées : bordure fine au survol, noir plein quand actif */
	:global(.nav-main [data-sidebar="menu-button"]),
	:global(.nav-main [data-slot="sidebar-menu-button"]) {
		border-radius: 0 !important;
		border: 1px solid transparent;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
	}

	:global(.nav-main [data-sidebar="menu-button"]:hover:not([data-active="true"])),
	:global(.nav-main [data-slot="sidebar-menu-button"]:hover:not([data-active="true"])) {
		background: transparent !important;
		color: #000 !important;
		border-color: #000;
	}

	:global(.nav-main [data-sidebar="menu-button"][data-active="true"]),
	:global(.nav-main [data-slot="sidebar-menu-button"][data-active="true"]) {
		background: #000 !important;
		color: #fff !important;
		border-color: #000;
		font-weight: 600;
	}

	/* Sous-menu */
	:global(.nav-main [data-sidebar="menu-sub"]),
	:global(.nav-main [data-slot="sidebar-menu-sub"]) {
		border-left: 1px solid #000;
		margin-left: 0.9rem;
	}

	:global(.nav-main [data-sidebar="menu-sub-button"]),
	:global(.nav-main [data-slot="sidebar-menu-sub-button"]) {
		border-radius: 0 !important;
		font-size: 0.85rem;
	}

	:global(.nav-main [data-sidebar="menu-action"]),
	:global(.nav-main [data-slot="sidebar-menu-action"]) {
		border-radius: 0 !important;
	}

	/* Pastille positionnée sur le MenuItem lui-même (pas sur l'icône), pour
	   ne jamais toucher à la structure interne du bouton shadcn-svelte.
	   Noire au repos, blanche quand l'entrée active est sur fond noir. */
	:global(.nav-main__item) {
		position: relative;
	}
	.nav-main__dot {
		position: absolute;
		top: 0.5rem;
		left: 1.55rem;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: #000;
		pointer-events: none;
	}
	:global(.nav-main__item:has([data-active="true"])) .nav-main__dot {
		background: #fff;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.nav-main [data-sidebar="menu-button"]),
		:global(.nav-main [data-slot="sidebar-menu-button"]) {
			transition: none;
		}
	}
</style>