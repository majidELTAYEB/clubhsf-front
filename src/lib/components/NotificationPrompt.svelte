<script lang="ts">
	import { onMount } from 'svelte';
	import BellIcon from '@lucide/svelte/icons/bell';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import BellCheck from '@lucide/svelte/icons/bell-check';
	import { getPushEligibility, type PushEligibility } from '$lib/pwa';
	import { subscribeToPush } from '$lib/push';

	let eligibility = $state<PushEligibility>('unsupported');
	let subscribing = $state(false);
	let subscribed = $state(false);
	let error = $state('');

	onMount(async () => {
		eligibility = getPushEligibility();

		if (eligibility === 'ready' && 'serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.ready;
				const existing = await registration.pushManager.getSubscription();
				subscribed = !!existing;
			} catch {
				// SW pas encore prêt, on ignore
			}
		}
	});

	async function handleSubscribe() {
		subscribing = true;
		error = '';
		try {
			await subscribeToPush();
			subscribed = true;
		} catch (e) {
			error = "Impossible d'activer les notifications, réessaie plus tard.";
			console.error(e);
		} finally {
			subscribing = false;
		}
	}
</script>

{#if eligibility === 'ready'}

	{#if subscribed}
	<BellCheck size={13} strokeWidth={2.5} />
{:else}
	<button
		type="button"
		class="notif-btn"
		onclick={handleSubscribe}
		disabled={subscribing}
	>
		{#if subscribing}
			<LoaderIcon size={13} strokeWidth={2} class="spin" />
		{:else}
			<BellIcon size={13} strokeWidth={1.75} />
		{/if}
	</button>

	{#if error}
		<p class="notif-error">{error}</p>
	{/if}
{/if}

{:else if eligibility === 'ios-needs-install'}
	<div class="ios-hint">
		<p>Pour activer les notifications sur iPhone/iPad, ajoute d'abord l'app à ton écran d'accueil :</p>
		<ol>
			<li>Appuie sur l'icône <strong>Partager</strong> (le carré avec la flèche) en bas de Safari</li>
			<li>Sélectionne <strong>« Sur l'écran d'accueil »</strong></li>
			<li>Ouvre l'app depuis l'icône ajoutée, puis reviens activer les notifications ici</li>
		</ol>
	</div>

{:else if eligibility === 'ios-too-old'}
	<p class="muted">Les notifications nécessitent iOS 16.4 ou plus récent.</p>

{:else}
	<p class="muted">Ton navigateur ne supporte pas les notifications push.</p>
{/if}

<style>
	.notif-btn {
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 0.9rem;
		background: none;
		color: var(--fg);
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
	}

	.notif-btn:hover:not(:disabled) {
		border-color: var(--fg);
	}

	.notif-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.notif-status {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		color: #121210;
	}

	.notif-error {
		margin-top: 0.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		color: #b23a1f;
	}

	.ios-hint,
	.muted {
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		color: #77746c;
		line-height: 1.5;
	}

	.ios-hint ol {
		margin-top: 0.5rem;
		padding-left: 1.1rem;
	}

	.ios-hint li {
		margin-bottom: 0.35rem;
	}

	.ios-hint strong {
		color: #121210;
		font-weight: 600;
	}

	:global(.notif-btn .spin) {
		animation: notif-spin 0.8s linear infinite;
	}
	@keyframes notif-spin {
		to { transform: rotate(360deg); }
	}
</style>