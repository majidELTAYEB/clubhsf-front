<script lang="ts">
	import { onMount } from 'svelte';
	import { getPushEligibility, type PushEligibility } from '$lib/pwa';
	import { subscribeToPush } from '$lib/push';

	let eligibility = $state<PushEligibility>('unsupported');
	let subscribing = $state(false);
	let error = $state('');

	onMount(() => {
		eligibility = getPushEligibility();
	});

	async function handleSubscribe() {
		subscribing = true;
		error = '';
		try {
			await subscribeToPush();
		} catch (e) {
			error = "Impossible d'activer les notifications, réessaie plus tard.";
			console.error(e);
		} finally {
			subscribing = false;
		}
	}
</script>

{#if eligibility === 'ready'}
	<button on:click={handleSubscribe} disabled={subscribing}>
		{subscribing ? 'Activation...' : 'Activer les notifications'}
	</button>
	{#if error}<p class="error">{error}</p>{/if}

{:else if eligibility === 'ios-needs-install'}
	<div class="ios-hint">
		<p>Pour activer les notifications sur iPhone/iPad, ajoute d'abord l'app à ton écran d'accueil :</p>
		<ol>
			<li>Appuie sur l'icône <strong>Partager</strong> (le carré avec la flèche) en bas de Safari</li>
			<li>Sélectionne <strong>"Sur l'écran d'accueil"</strong></li>
			<li>Ouvre l'app depuis l'icône ajoutée, puis reviens activer les notifications ici</li>
		</ol>
	</div>

{:else if eligibility === 'ios-too-old'}
	<p class="muted">Les notifications nécessitent iOS 16.4 ou plus récent.</p>

{:else}
	<p class="muted">Ton navigateur ne supporte pas les notifications push.</p>
{/if}