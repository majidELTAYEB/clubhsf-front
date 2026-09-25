<script lang="ts">
import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import ConversationsList from '$lib/features/messaging/components/ConversationsList.svelte';
	import { unreadStore } from '$lib/features/messaging/unread.svelte';


	let { children }: { children: () => unknown } = $props();

	// True dès qu'on est sur /messages/[conversationId] : une conversation
	// est ouverte. Sert à savoir quel panneau afficher en mobile (un seul à
	// la fois) et si le placeholder "sélectionne une conversation" doit
	// s'afficher en desktop.
	// ⚠️ Ajuste "conversationId" ci-dessous pour matcher exactement le nom
	// de ton dossier dynamique (src/routes/messages/[conversationId]/).
	let isThreadOpen = $derived(page.params.id !== undefined);

	onDestroy(() => {
		unreadStore.refresh();
	});
</script>

<div class="messages-shell">
	<aside class="messages-shell__list" class:messages-shell__list--hidden={isThreadOpen}>
		<ConversationsList currentUserId={page.data.userProfile?.id ?? ''} />
	</aside>

	<main class="messages-shell__thread" class:messages-shell__thread--hidden={!isThreadOpen}>
		{#if isThreadOpen}
			{@render children()}
		{:else}
			<div class="messages-shell__empty">
				<p class="messages-shell__empty-title">Tes messages</p>
				<p class="messages-shell__empty-body">Choisis une conversation dans la liste pour l'ouvrir ici.</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.messages-shell {
	--border: #e6e3db;
	--header-height: 3.5rem;
	display: flex;
	height: 100%;
	overflow: hidden;
}

	.messages-shell__list {
		width: 22rem;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		overflow-y: auto;
	}

	.messages-shell__thread {
		flex: 1;
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}


	.messages-shell__empty {
		margin: auto;
		text-align: center;
		max-width: 20rem;
		padding: 1.5rem;
	}
	.messages-shell__empty-title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.2rem;
		color: #000;
	}
	.messages-shell__empty-body {
		margin-top: 0.4rem;
		font-size: 0.82rem;
		color: #666666;
	}

	/* Mobile : un seul panneau visible à la fois, chacun prend toute la largeur.
	   Le composant liste garde son propre bouton retour (vers /community/posts),
	   et le fil garde le sien (vers /messages), déjà masqué en desktop. */
	@media (max-width: 859px) {
		.messages-shell__list,
		.messages-shell__thread {
			width: 100%;
			border-right: none;
		}
		.messages-shell__list--hidden,
		.messages-shell__thread--hidden {
			display: none;
		}
	}
</style>