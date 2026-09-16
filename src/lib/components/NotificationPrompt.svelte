<!-- <script lang="ts">
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
</style> -->


<script lang="ts">
	import { onMount } from 'svelte';
	import BellIcon from '@lucide/svelte/icons/bell';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import BellCheck from '@lucide/svelte/icons/bell-check';
	import XIcon from '@lucide/svelte/icons/x';
	import { getPushEligibility, type PushEligibility } from '$lib/pwa';
	import { subscribeToPush } from '$lib/push';

	// 'banner'  -> bloc explicatif avec CTA, à mettre en haut du fil / des écrans clés
	// 'compact' -> icône seule, pour le header (comportement d'origine)
	let { variant = 'banner' }: { variant?: 'banner' | 'compact' } = $props();

	let eligibility = $state<PushEligibility>('unsupported');
	let subscribing = $state(false);
	let subscribed = $state(false);
	let error = $state('');
	let dismissed = $state(false);

	const DISMISS_KEY = 'notif-banner-dismissed-at';
	const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

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

		if (variant === 'banner') {
			const dismissedAt = localStorage.getItem(DISMISS_KEY);
			if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) {
				dismissed = true;
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

	function handleDismiss() {
		dismissed = true;
		localStorage.setItem(DISMISS_KEY, String(Date.now()));
	}
</script>

{#if variant === 'compact'}
	<!-- ===== Variante header : icône seule ===== -->
	{#if eligibility === 'ready'}
		{#if subscribed}
			<span class="compact-status" aria-label="Notifications activées">
				<BellCheck size={13} strokeWidth={2.5} />
			</span>
		{:else}
			<button
				type="button"
				class="notif-btn compact"
				onclick={handleSubscribe}
				disabled={subscribing}
				aria-label="Activer les notifications"
				title="Activer les notifications"
			>
				{#if subscribing}
					<LoaderIcon size={13} strokeWidth={2} class="spin" />
				{:else}
					<BellIcon size={13} strokeWidth={1.75} />
				{/if}
			</button>
		{/if}
	{/if}

{:else if !dismissed && !subscribed}
	<!-- ===== Variante banner : à placer en haut du fil ===== -->
	{#if eligibility === 'ready'}
		<div class="notif-banner">
			<div class="notif-banner__icon">
				<BellIcon size={18} strokeWidth={1.75} />
			</div>
			<div class="notif-banner__content">
				<p class="notif-banner__title">Ne rate aucun live ni article</p>
				<p class="notif-banner__text">
					Active les notifications pour être prévenu à chaque nouveau contenu.
				</p>
				{#if error}
					<p class="notif-error">{error}</p>
				{/if}
			</div>
			<div class="notif-banner__actions">
				<button
					type="button"
					class="notif-btn"
					onclick={handleSubscribe}
					disabled={subscribing}
				>
					{#if subscribing}
						<LoaderIcon size={13} strokeWidth={2} class="spin" />
						Activation…
					{:else}
						<BellIcon size={13} strokeWidth={1.75} />
						Activer
					{/if}
				</button>
				<button
					type="button"
					class="notif-dismiss"
					onclick={handleDismiss}
					aria-label="Fermer"
				>
					<XIcon size={14} strokeWidth={1.75} />
				</button>
			</div>
		</div>

	{:else if eligibility === 'ios-needs-install'}
		<div class="notif-banner">
			<div class="notif-banner__icon">
				<BellIcon size={18} strokeWidth={1.75} />
			</div>
			<div class="notif-banner__content">
				<p class="notif-banner__title">Installe l'app pour ne rien manquer</p>
				<p class="notif-banner__text">
					Sur iPhone, les notifications nécessitent d'ajouter l'app à ton écran d'accueil :
				</p>
				<ol class="ios-steps">
					<li>Appuie sur <strong>Partager</strong> en bas de Safari</li>
					<li>Sélectionne <strong>« Sur l'écran d'accueil »</strong></li>
					<li>Ouvre l'app depuis l'icône ajoutée, puis reviens ici</li>
				</ol>
			</div>
			<div class="notif-banner__actions">
				<button
					type="button"
					class="notif-dismiss"
					onclick={handleDismiss}
					aria-label="Fermer"
				>
					<XIcon size={14} strokeWidth={1.75} />
				</button>
			</div>
		</div>

	{:else if eligibility === 'ios-too-old'}
		<p class="muted">Les notifications nécessitent iOS 16.4 ou plus récent.</p>

	{:else}
		<!-- navigateur non supporté : on n'affiche rien, inutile de gêner l'utilisateur -->
	{/if}
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
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.notif-btn:hover:not(:disabled) {
		opacity: 0.85;
	}

	.notif-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.notif-btn.compact {
		background: none;
		color: #121210;
		padding: 0.4rem;
	}

	.notif-btn.compact:hover:not(:disabled) {
		opacity: 1;
		border-color: #121210;
	}

	.compact-status {
		display: inline-flex;
		align-items: center;
		color: #121210;
	}

	/* ===== Banner ===== */
	.notif-banner {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		padding: 0.9rem 1rem;
		background: #f7f5f0;
		border: 1px solid #e6e3db;
		font-family: 'Inter', sans-serif;
	}

	.notif-banner__icon {
		flex-shrink: 0;
		color: #121210;
		margin-top: 0.15rem;
	}

	.notif-banner__content {
		flex: 1;
		min-width: 0;
	}

	.notif-banner__title {
		font-size: 0.85rem;
		font-weight: 600;
		color: #121210;
		margin: 0 0 0.2rem;
	}

	.notif-banner__text {
		font-size: 0.78rem;
		color: #77746c;
		margin: 0;
		line-height: 1.4;
	}

	.notif-banner__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.notif-dismiss {
		background: none;
		border: none;
		color: #77746c;
		cursor: pointer;
		padding: 0.3rem;
		display: inline-flex;
	}

	.notif-dismiss:hover {
		color: #121210;
	}

	.notif-error {
		margin-top: 0.4rem;
		font-size: 0.72rem;
		color: #b23a1f;
	}

	.ios-steps {
		margin: 0.4rem 0 0;
		padding-left: 1.1rem;
		font-size: 0.78rem;
		color: #77746c;
		line-height: 1.5;
	}

	.ios-steps strong {
		color: #121210;
		font-weight: 600;
	}

	.muted {
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		color: #77746c;
		line-height: 1.5;
	}

	:global(.notif-btn .spin) {
		animation: notif-spin 0.8s linear infinite;
	}
	@keyframes notif-spin {
		to { transform: rotate(360deg); }
	}
</style>