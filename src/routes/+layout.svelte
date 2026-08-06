<!-- <script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import SidebarTriggerResponsive from "$lib/components/sidebar-trigger-responsive.svelte";
	import CreateMenu from "$lib/components/create-menu.svelte";

	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from "svelte-sonner";
	import type { LayoutData } from './$types';
	import type { Snippet } from "svelte";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();


	let isAuthenticated = $derived(data.user !== null);
	let hasFullAccess = $derived(data.user?.hasFullAccess === true);
</script>

{#if isAuthenticated}
	<Toaster position="top-center" richColors/>

	{#if hasFullAccess}
		<Sidebar.Provider open={data.sidebarOpen} isMobileGuess={data.isMobileGuess}>
			<AppSidebar />
			<Sidebar.Inset>
				<header class="navbar">
					<div class="navbar__left">
						<SidebarTriggerResponsive />
						<span class="navbar__mark">Club</span>
					</div>
					{#if data.user?.role === 'admin'}
						<div class="navbar__right">
							<CreateMenu />
						</div>
					{/if}
				</header>

				{@render children()}
			</Sidebar.Inset>
		</Sidebar.Provider>
	{:else}
		{@render children()}
	{/if}
{:else}
	{@render children()}
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.navbar {
		--bg: #ffffff;
		--fg: #121210;
		--border: #e6e3db;

		display: flex;
		height: 4rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.navbar__left {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding-left: 1rem;
	}

	.navbar__mark {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
		color: var(--fg);
		padding-left: 0.9rem;
		border-left: 1px solid var(--border);
		line-height: 1;
	}

	.navbar__right {
		padding-right: 1rem;
	}
</style> -->

<script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import SidebarTriggerResponsive from "$lib/components/sidebar-trigger-responsive.svelte";
	import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
	import CreateMenu from "$lib/components/create-menu.svelte";

	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from "svelte-sonner";
	import type { LayoutData } from './$types';
	import type { Snippet } from "svelte";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();


	let isAuthenticated = $derived(data.user !== null);
	let hasFullAccess = $derived(data.user?.hasFullAccess === true);
</script>

{#if isAuthenticated}
	<Toaster position="top-center" richColors/>

	{#if hasFullAccess}
		<Sidebar.Provider open={data.sidebarOpen} isMobileGuess={data.isMobileGuess}>
			<AppSidebar />
			<Sidebar.Inset>
			{#if data.user?.role === 'admin'}
				<header class="navbar">
					<div class="navbar__left">
						<div class="trigger-wrap" class:trigger-wrap--mobile-hidden={data.user?.role !== 'admin'}>
							<SidebarTriggerResponsive />
						</div>
						<span class="navbar__mark">Club</span>
					</div>
						<div class="navbar__right">
							<CreateMenu />
						</div>
				</header>
					{/if}

				<div class="mobile-content-pad">
					{@render children()}
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>

		{#if data.user?.role !== 'admin'}
			<MobileBottomNav />
		{/if}
	{:else}
		{@render children()}
	{/if}
{:else}
	{@render children()}
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.navbar {
		--bg: #ffffff;
		--fg: #121210;
		--border: #e6e3db;

		display: flex;
		height: 4rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.navbar__left {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding-left: 1rem;
	}

	.navbar__mark {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
		color: var(--fg);
		padding-left: 0.9rem;
		border-left: 1px solid var(--border);
		line-height: 1;
	}

	.navbar__right {
		padding-right: 1rem;
	}

	/* Empêche le contenu d'être caché derrière la bottom nav fixe sur mobile */
	@media (max-width: 767px) {
		.mobile-content-pad {
			padding-bottom: calc(3.75rem + env(safe-area-inset-bottom));
		}
	}

	/* Sur mobile, un non-admin a déjà la bottom nav — inutile d'avoir aussi
	   le trigger hamburger de la sidebar en double. Reste visible sur desktop
	   pour tout le monde, et sur mobile pour les admins (pas de bottom nav). */
	@media (max-width: 767px) {
		.trigger-wrap--mobile-hidden {
			display: none;
		}
	}
</style>