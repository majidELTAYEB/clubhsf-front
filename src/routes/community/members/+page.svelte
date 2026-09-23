<script lang="ts">
	import { goto } from '$app/navigation';
	import SearchIcon from "@lucide/svelte/icons/search";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import { searchProfiles } from '$lib/features/profile/api';
	import type { SearchProfile } from '$lib/features/profile/types';

	let query = $state('');
	let results = $state<SearchProfile[]>([]);
	let total = $state(0);
	let offset = $state(0);
	const limit = 20;

	let loading = $state(false);
	let loadingMore = $state(false);
	let searchError = $state<string | null>(null);
	let hasSearched = $state(false);

	let debounceHandle: ReturnType<typeof setTimeout> | undefined;
	let requestId = 0; // ignore les reponses obsoletes (race condition)

	function onInput() {
		if (debounceHandle) clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => runSearch(), 300);
	}

	async function runSearch() {
		const q = query.trim();
		offset = 0;

		if (!q) {
			requestId++;
			results = [];
			total = 0;
			hasSearched = false;
			loading = false;
			return;
		}

		const currentRequest = ++requestId;
		// Pas de "loading = true" qui vide l'ecran : on garde les anciens
		// resultats affiches jusqu'a ce que les nouveaux arrivent, pour
		// eviter le flash skeleton -> resultats a chaque frappe.
		loading = true;
		searchError = null;
		hasSearched = true;

		try {
			const res = await searchProfiles(q, { limit, offset: 0 });
			if (currentRequest !== requestId) return; // reponse perimee, ignoree
			results = res.results;
			total = res.total;
		} catch (err) {
			if (currentRequest !== requestId) return;
			searchError = err instanceof Error ? err.message : 'Impossible de lancer la recherche';
		} finally {
			if (currentRequest === requestId) loading = false;
		}
	}

	async function loadMore() {
		const q = query.trim();
		if (!q || loadingMore || results.length >= total) return;

		loadingMore = true;
		try {
			const nextOffset = offset + limit;
			const res = await searchProfiles(q, { limit, offset: nextOffset });
			results = [...results, ...res.results];
			offset = nextOffset;
		} catch {
			// Échec silencieux sur "charger plus", même logique que le feed posts.
		} finally {
			loadingMore = false;
		}
	}
</script>

<svelte:head>
	<title>Membres</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<button type="button" class="back-btn" onclick={() => goto('/community/posts')} aria-label="Retour">
			<ArrowLeftIcon size={16} strokeWidth={2} />
		</button>
		<span class="masthead__eyebrow">Communauté</span>
	</div>

	<div class="archive__inner">
		<header class="heading">
			<h1 class="title">Les membres</h1>
			<p class="subtitle">Retrouve un membre par pseudo, ville ou objectif.</p>
		</header>

		<div class="search-bar">
			<SearchIcon size={16} strokeWidth={2} class="search-bar__icon" />
			<input
				type="text"
				placeholder="Rechercher un pseudo, une ville, un objectif…"
				bind:value={query}
				oninput={onInput}
			/>
		</div>

		{#if loading && results.length === 0}
			<div class="member-list">
				{#each Array(4) as _}
					<div class="skeleton-row">
						<div class="skeleton-avatar"></div>
						<div class="skeleton-lines">
							<div class="skeleton-line" style="width: 40%"></div>
							<div class="skeleton-line" style="width: 60%"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if searchError}
			<div class="empty-state">
				<p class="empty-state__title">Une erreur est survenue</p>
				<p class="empty-state__body">{searchError}</p>
			</div>
		{:else if !hasSearched}
			<div class="empty-state">
				<p class="empty-state__title">Commence à taper pour chercher</p>
				<p class="empty-state__body">Par pseudo, localisation ou objectif.</p>
			</div>
		{:else if results.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucun membre trouvé</p>
				<p class="empty-state__body">Essaie un autre terme de recherche.</p>
			</div>
		{:else}
			<div class="member-list" class:member-list--refreshing={loading}>
				{#each results as member (member.user_id)}
					<a href="/profile/{member.username}" class="member-row">
						<div class="member-avatar">
							{#if member.avatar_url}
								<img src={member.avatar_url} alt={member.username} />
							{:else}
								<span>{member.username.charAt(0).toUpperCase()}</span>
							{/if}
						</div>
						<div class="member-info">
							<span class="member-username">@{member.username}</span>
							{#if member.location}
								<span class="member-location">{member.location}</span>
							{/if}
							{#if member.goals.length > 0}
								<div class="member-goals">
									{#each member.goals as goal (goal.id)}
										<span class="goal-badge">{goal.label}</span>
									{/each}
								</div>
							{/if}
						</div>
					</a>
				{/each}
			</div>

			{#if results.length < total}
				<div class="load-more">
					<button type="button" onclick={loadMore} disabled={loadingMore}>
						{loadingMore ? 'Chargement…' : `Charger plus (${results.length}/${total})`}
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		min-height: 100%;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--border);
	}
	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		color: var(--fg);
		cursor: pointer;
		margin: -0.3rem;
	}
	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.archive__inner {
		max-width: 640px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 6rem;
	}

	.heading {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}
	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.9rem, 4.5vw, 2.5rem);
		line-height: 1.1;
	}
	.subtitle {
		margin-top: 0.5rem;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 1.75rem;
		padding: 0.7rem 0.9rem;
		border: 1px solid var(--border);
		color: var(--muted);
	}
	.search-bar input {
		flex: 1;
		border: none;
		outline: none;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		color: var(--fg);
		background: none;
	}
	.search-bar input::placeholder {
		color: var(--muted);
	}

	.member-list {
		display: flex;
		flex-direction: column;
		margin-top: 1.5rem;
	}
	.member-list--refreshing {
		opacity: 0.6;
		transition: opacity 0.15s ease;
	}

	.member-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.9rem 0.25rem;
		border-bottom: 1px solid var(--border);
		text-decoration: none;
		color: inherit;
	}
	.member-row:hover .member-username {
		text-decoration: underline;
	}

	.member-avatar {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		overflow: hidden;
		background: #eeece6;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces', serif;
		font-weight: 500;
		color: var(--muted);
		flex-shrink: 0;
	}
	.member-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.member-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}
	.member-username {
		font-size: 0.88rem;
		font-weight: 500;
	}
	.member-location {
		font-size: 0.78rem;
		color: var(--muted);
	}
	.member-goals {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.15rem;
	}
	.goal-badge {
		font-size: 0.68rem;
		padding: 0.15rem 0.5rem;
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title {
		font-size: 0.9rem;
		font-weight: 500;
	}
	.empty-state__body {
		margin-top: 0.3rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.load-more {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
	}
	.load-more button {
		padding: 0.65rem 1.5rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--fg);
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	.load-more button:hover {
		border-color: var(--fg);
	}
	.load-more button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.9rem 0.25rem;
	}
	.skeleton-avatar {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		background: #eeece6;
		flex-shrink: 0;
	}
	.skeleton-lines {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex: 1;
	}
	.skeleton-line {
		height: 0.7rem;
		background: #eeece6;
	}
</style>