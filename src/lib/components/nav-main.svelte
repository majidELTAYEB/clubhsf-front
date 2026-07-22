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
					<Sidebar.MenuItem {...props}>
						<Sidebar.MenuButton tooltipContent={mainItem.title} isActive={active}>
							{#snippet child({ props })}
								<a href={mainItem.url} {...props}>
									<mainItem.icon />
									<span>{mainItem.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
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
</style>