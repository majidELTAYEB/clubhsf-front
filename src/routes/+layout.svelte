<!-- <script lang="ts">
	import { onMount } from 'svelte';
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
	import InstallHint from "$lib/components/InstallHint.svelte";
	import { unreadStore } from '$lib/features/messaging/unread.svelte';


	let { data, children }: { data: LayoutData; children: Snippet } = $props();


	let isAuthenticated = $derived(data.user !== null);
	let hasFullAccess = $derived(data.user?.hasFullAccess === true);

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});

	$effect(() => {
		if (hasFullAccess && data.userProfile?.id) {
			unreadStore.init(data.userProfile.id);
		}
	});

</script>

{#if isAuthenticated}
	<Toaster position="top-center" richColors/>

	{#if hasFullAccess}
		<div class="app-shell">
			<Sidebar.Provider open={data.sidebarOpen} isMobileGuess={data.isMobileGuess} style="flex: 1; min-height: 0;">
				<AppSidebar />
				<Sidebar.Inset class="min-h-0">
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
						<InstallHint />
						{@render children()}
					</div>
				</Sidebar.Inset>
			</Sidebar.Provider>

			{#if data.user?.role !== 'admin'}
				<MobileBottomNav />
			{/if}
		</div>
	{:else}
		{@render children()}
	{/if}
{:else}
	{@render children()}
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');

	/* Barre admin : même filet noir et même typo que les mastheads de pages */
	.navbar {
		--bg: #ffffff;
		--fg: #000000;
		--rule: #000000;

		display: flex;
		height: 4rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		background: var(--bg);
		color: var(--fg);
		border-bottom: 1px solid var(--rule);
		/* padding-top: env(safe-area-inset-top); */
	}

	.navbar__left {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding-left: 1rem;
	}

	.navbar__mark {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: 1.15rem;
		letter-spacing: -0.03em;
		color: var(--fg);
		padding-left: 0.9rem;
		border-left: 1px solid var(--rule);
		line-height: 1;
	}

	.navbar__right {
		padding-right: 1rem;
	}

	.mobile-content-pad {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		box-sizing: border-box;
	}

	/* Empêche le contenu d'être caché derrière la bottom nav fixe sur mobile */
	/* @media (max-width: 767px) {
		.mobile-content-pad {
			padding-bottom: calc(3.75rem + env(safe-area-inset-bottom));
		}
	} */

	/* Sur mobile, un non-admin a déjà la bottom nav — inutile d'avoir aussi
	   le trigger hamburger de la sidebar en double. Reste visible sur desktop
	   pour tout le monde, et sur mobile pour les admins (pas de bottom nav). */
	/* @media (max-width: 767px) {
		.trigger-wrap--mobile-hidden {
			display: none;
		}
	} */

	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
	}
</style> -->


<script lang="ts">
	import { onMount } from 'svelte';
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
	import InstallHint from "$lib/components/InstallHint.svelte";
	import { unreadStore } from '$lib/features/messaging/unread.svelte';


	let { data, children }: { data: LayoutData; children: Snippet } = $props();


	let isAuthenticated = $derived(data.user !== null);
	let hasFullAccess = $derived(data.user?.hasFullAccess === true);

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});

	$effect(() => {
		if (hasFullAccess && data.userProfile?.id) {
			unreadStore.init(data.userProfile.id);
		}
	});

</script>

{#if isAuthenticated}
	<Toaster position="top-center" richColors/>

	{#if hasFullAccess}
		<div class="app-shell">
			<Sidebar.Provider open={data.sidebarOpen} isMobileGuess={data.isMobileGuess} style="flex: 1; min-height: 0;">
				<AppSidebar />
				<Sidebar.Inset class="min-h-0">
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
						<InstallHint />
						{@render children()}
					</div>
				</Sidebar.Inset>
			</Sidebar.Provider>

			{#if data.user?.role !== 'admin'}
				<MobileBottomNav />
			{/if}
		</div>
	{:else}
		{@render children()}
	{/if}
{:else}
	{@render children()}
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');

	/* Hauteur d'en-tête commune : la zone logo + nom de la sidebar, la navbar admin
	   et le masthead de chaque page partagent la même valeur, donc les filets du
	   bas s'alignent sur une seule ligne. */
	:global(:root) {
		--header-height: 4rem;
	}

	/* Masthead de page : hauteur fixe (bordure comprise) au lieu d'un padding.
	   L'encoche iPhone (safe-area) s'ajoute au-dessus, elle vaut 0 sur desktop.
	   !important pour passer devant les anciens `padding` définis page par page. */
	:global(.masthead) {
		box-sizing: border-box !important;
		height: calc(var(--header-height) + env(safe-area-inset-top, 0px)) !important;
		padding: env(safe-area-inset-top, 0px) clamp(1rem, 4vw, 1.5rem) 0 !important;
		align-items: center;
	}

	/* Barre admin : même filet noir et même typo que les mastheads de pages */
	.navbar {
		--bg: #ffffff;
		--fg: #000000;
		--rule: #000000;

		display: flex;
		box-sizing: border-box;
		height: calc(var(--header-height) + env(safe-area-inset-top, 0px));
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		background: var(--bg);
		color: var(--fg);
		border-bottom: 1px solid var(--rule);
		padding-top: env(safe-area-inset-top);
	}

	.navbar__left {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding-left: 1rem;
	}

	.navbar__mark {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: 1.15rem;
		letter-spacing: -0.03em;
		color: var(--fg);
		padding-left: 0.9rem;
		border-left: 1px solid var(--rule);
		line-height: 1;
	}

	.navbar__right {
		padding-right: 1rem;
	}

	.mobile-content-pad {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		box-sizing: border-box;
	}

	/* Empêche le contenu d'être caché derrière la bottom nav fixe sur mobile */
	/* @media (max-width: 767px) {
		.mobile-content-pad {
			padding-bottom: calc(3.75rem + env(safe-area-inset-bottom));
		}
	} */

	/* Sur mobile, un non-admin a déjà la bottom nav — inutile d'avoir aussi
	   le trigger hamburger de la sidebar en double. Reste visible sur desktop
	   pour tout le monde, et sur mobile pour les admins (pas de bottom nav). */
	/* @media (max-width: 767px) {
		.trigger-wrap--mobile-hidden {
			display: none;
		}
	} */

	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
	}
</style>