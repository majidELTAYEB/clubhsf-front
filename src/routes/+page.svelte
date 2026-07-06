<script lang="ts">
	import { authState } from '$lib/features/auth/store';
	import { getMe } from '$lib/features/auth/api';

	async function checkBackend() {
		const me = await getMe();
		console.log(me);
	}
</script>

<button onclick={checkBackend}>
	Tester l'appel backend
</button>

{#if $authState.isAuthenticated}
	<p>Connecté : {$authState.user?.email}</p>
        <a href="/auth/logout">Se déconnecter</a>
{:else}
	<a href="/auth/login">Se connecter</a>

{/if}