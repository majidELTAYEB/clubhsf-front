
<script lang="ts">
	import { authState } from '$lib/features/auth/store.svelte';
	import { getMe } from '$lib/features/auth/api';
	import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

	let checking = $state(false);
	let lastResult: string | null = $state(null);

    $effect(() => {
		if (authState.isAuthenticated) {
			goto(resolve('/masterclass'));
            
		}
	});

	async function checkBackend() {
		checking = true;
		try {
			const me = await getMe();
			console.log(me);
			lastResult = JSON.stringify(me, null, 2);
		} finally {
			checking = false;
		}
	}
</script> 

 <main class="stage">
	<div class="aurora aurora--one" aria-hidden="true"></div>
	<div class="aurora aurora--two" aria-hidden="true"></div>
	<div class="aurora aurora--three" aria-hidden="true"></div>

	<section class="pane">
		<div class="pane__sheen" aria-hidden="true"></div>

		<header class="pane__header">
			<span class="eyebrow">Connexion</span>
			<h1>Espace compte</h1>
		</header>

		{#if authState.isAuthenticated}
			<div class="status status--on">
				<span class="dot"></span>
				<p>Connecté : <strong>{authState.user?.email}</strong></p>
			</div>
			<a class="btn btn--ghost" href={resolve('/auth/logout')}>Se déconnecter</a>
		{:else}
			<div class="status status--off">
				<span class="dot"></span>
				<p>Non connecté</p>
			</div>
			<a class="btn btn--primary" href={resolve('/auth/login')}>Se connecter</a>
		{/if}

		<div class="divider" aria-hidden="true"></div>

		<button class="btn btn--glass" onclick={checkBackend} disabled={checking}>
			{checking ? 'Appel en cours…' : "Tester l'appel backend"}
		</button>

		{#if lastResult}
			<pre class="result">{lastResult}</pre>
		{/if}
	</section>
</main> 