<!-- <script lang="ts">
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import SidebarTriggerResponsive from "$lib/components/sidebar-trigger-responsive.svelte";
	import CreateMenu from "$lib/components/create-menu.svelte";

	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { setUser, authState } from '$lib/features/auth/store.svelte';
	import { Toaster } from "svelte-sonner";
	import type { LayoutData } from './$types';
	import type { Snippet } from "svelte";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	$effect(() => {
		setUser(data.user);
	});
</script>

<ModeWatcher defaultMode="light" />

{#if authState.isAuthenticated}
	<Toaster position="top-center" richColors theme="dark" />
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			<header class="navbar">
				<div class="navbar__left">
					<SidebarTriggerResponsive />
					<span class="navbar__mark">Club</span>
				</div>
				{#if authState.user?.role === 'admin'}
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
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import SidebarTriggerResponsive from "$lib/components/sidebar-trigger-responsive.svelte";
	import CreateMenu from "$lib/components/create-menu.svelte";

	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { setUser, authState } from '$lib/features/auth/store.svelte';
	import { Toaster } from "svelte-sonner";
	import type { LayoutData } from './$types';
	import type { Snippet } from "svelte";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	$effect(() => {
		setUser(data.user);
	});

	// Posé par +layout.server.ts (lecture du cookie user_profile) — indépendant
	// de authState côté client pour que la vérification tienne même avant hydratation.
	let isPremium = $derived(data.user?.is_premium === true);
</script>

<ModeWatcher defaultMode="light" />

{#if authState.isAuthenticated}
	<Toaster position="top-center" richColors theme="dark" />

	{#if isPremium}
		<Sidebar.Provider>
			<AppSidebar />
			<Sidebar.Inset>
				<header class="navbar">
					<div class="navbar__left">
						<SidebarTriggerResponsive />
						<span class="navbar__mark">Club</span>
					</div>
					{#if authState.user?.role === 'admin'}
						<div class="navbar__right">
							<CreateMenu />
						</div>
					{/if}
				</header>

				{@render children()}
			</Sidebar.Inset>
		</Sidebar.Provider>
	{:else}
		<!-- Pas premium : aucune sidebar, aucune navigation — seule /premium est
		     joignable de toute façon, +layout.server.ts renvoie ici tout le reste. -->
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
</style>