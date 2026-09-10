<script lang="ts">
	import { onMount } from 'svelte';
	import Share from '@lucide/svelte/icons/share';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import * as Drawer from "$lib/components/ui/drawer/index.js";

	let platform = $state<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
	let open = $state(false);

	onMount(() => {
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(navigator as any).standalone === true;

		if (isStandalone) return;
		if (sessionStorage.getItem('install-hint-dismissed') === '1') return;

		const ua = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(ua)) {
			platform = 'ios';
		} else if (/Android/.test(ua)) {
			platform = 'android';
		} else {
			platform = 'desktop';
		}

		if (platform === 'ios' || platform === 'android') {
			open = true;
		}
	});

	function handleOpenChange(next: boolean) {
		open = next;
		if (!next) {
			sessionStorage.setItem('install-hint-dismissed', '1');
		}
	}
</script>

<Drawer.Root {open} onOpenChange={handleOpenChange}>
	<Drawer.Content>
		<div class="install-hint">
			<span class="eyebrow">Accès rapide</span>
			<Drawer.Title class="install-hint__title">
				Ajoute l'app à ton écran d'accueil
			</Drawer.Title>

			{#if platform === 'ios'}
				<Drawer.Description class="install-hint__steps">
					Appuie sur <Share size={13} strokeWidth={1.75} aria-hidden="true" />
					<strong>Partager</strong>, puis <strong>« Sur l'écran d'accueil »</strong>
				</Drawer.Description>
			{:else}
				<Drawer.Description class="install-hint__steps">
					Ouvre le menu <MoreVertical size={13} strokeWidth={1.75} aria-hidden="true" />
					de ton navigateur, puis <strong>« Installer l'application »</strong>
				</Drawer.Description>
			{/if}

			<Drawer.Footer>
				<Drawer.Close class="btn-cancel">
					Plus tard
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>

<style>
	.install-hint {
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #121210;

		padding: 0.25rem 1.25rem 1.5rem;
		font-family: 'Inter', sans-serif;
		color: var(--fg);
	}

	.eyebrow {
		display: block;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 0.5rem;
	}

	:global(.install-hint__title) {
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 1.05rem;
		line-height: 1.3;
		color: var(--fg);
	}

	:global(.install-hint__steps) {
		margin-top: 0.6rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--muted);
	}

	:global(.install-hint__steps strong) {
		font-weight: 600;
		color: var(--fg);
	}

	:global(.install-hint__steps svg) {
		display: inline;
		vertical-align: -2px;
		color: var(--fg);
	}

	:global(.btn-cancel) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0.55rem 0.9rem;
		background: none;
		color: var(--muted);
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
		font-size: 0.72rem;
		font-weight: 500;
		cursor: pointer;
	}

	:global(.btn-cancel:hover) {
		border-color: var(--fg);
		color: var(--fg);
	}
</style>