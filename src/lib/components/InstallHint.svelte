<script lang="ts">
	import { onMount } from 'svelte';
	import Share from '@lucide/svelte/icons/share';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';

	let platform = $state<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
	let dismissed = $state(false);

	onMount(() => {
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(navigator as any).standalone === true;

		if (isStandalone) return;
		if (sessionStorage.getItem('install-hint-dismissed') === '1') {
			dismissed = true;
			return;
		}

		const ua = navigator.userAgent;
		if (/iPad|iPhone|iPod/.test(ua)) {
			platform = 'ios';
		} else if (/Android/.test(ua)) {
			platform = 'android';
		} else {
			platform = 'desktop';
		}
	});

	function dismiss() {
		dismissed = true;
		sessionStorage.setItem('install-hint-dismissed', '1');
	}
</script>

{#if !dismissed && (platform === 'ios' || platform === 'android')}
	<aside class="install-hint">
		<div class="install-hint__index">01</div>

		<div class="install-hint__body">
			<span class="install-hint__eyebrow">Hors-ligne &amp; accès rapide</span>
			<p class="install-hint__title">Ajoute l'app à ton écran d'accueil</p>

			{#if platform === 'ios'}
				<p class="install-hint__steps">
					Appuie sur <Share size={13} strokeWidth={2} aria-hidden="true" />
					<strong>Partager</strong>, puis <strong>« Sur l'écran d'accueil »</strong>
				</p>
			{:else}
				<p class="install-hint__steps">
					Ouvre le menu <MoreVertical size={13} strokeWidth={2} aria-hidden="true" />
					de ton navigateur, puis <strong>« Installer l'application »</strong>
				</p>
			{/if}
		</div>

		<button class="install-hint__dismiss" onclick={dismiss} aria-label="Fermer">✕</button>
	</aside>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.install-hint {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 0.9rem;
		padding: 0.9rem 1rem;
		margin: 0 0 1px;
		background: var(--bg);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		border-left: 2px solid var(--accent);
		font-family: 'Inter', sans-serif;
		color: var(--fg);
	}

	.install-hint__index {
		flex-shrink: 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.02em;
		color: var(--muted);
		padding-top: 0.15rem;
	}

	.install-hint__body {
		flex: 1;
		min-width: 0;
	}

	.install-hint__eyebrow {
		display: block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.install-hint__title {
		margin-top: 0.3rem;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
		line-height: 1.25;
	}

	.install-hint__steps {
		margin-top: 0.35rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--muted);
	}

	.install-hint__steps strong {
		font-weight: 600;
		color: var(--fg);
	}

	.install-hint__steps :global(svg) {
		display: inline;
		vertical-align: -2px;
		color: var(--fg);
	}

	.install-hint__dismiss {
		flex-shrink: 0;
		background: none;
		border: none;
		cursor: pointer;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--muted);
		padding: 0.15rem 0.25rem;
		line-height: 1;
	}

	.install-hint__dismiss:hover {
		color: var(--fg);
	}
</style>