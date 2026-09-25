<script lang="ts">
	import { goto } from '$app/navigation';
	import SearchIcon from "@lucide/svelte/icons/search";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import XIcon from "@lucide/svelte/icons/x";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import { searchProfiles, getGoalsCatalog } from '$lib/features/profile/api';
	import { createConversation } from '$lib/features/messaging/api';
	import type { SearchProfile, Goal } from '$lib/features/profile/types';

	let query = $state('');
	let selectedCity = $state<string | null>(null);
	let selectedGoal = $state<string | null>(null);

	let results = $state<SearchProfile[]>([]);
	let total = $state(0);
	let offset = $state(0);
	const limit = 20;

	let loading = $state(false);
	let searchError = $state<string | null>(null);

	// id du membre en cours de contact (désactive son bouton le temps de
	// l'appel, évite un double-clic qui créerait deux requêtes en parallèle)
	let contactingId = $state<string | null>(null);
	let contactError = $state<string | null>(null);

	let debounceHandle: ReturnType<typeof setTimeout> | undefined;
	let requestId = 0; // ignore les reponses obsoletes (race condition)

	// Villes en dur (pas d'endpoint dedie), objectifs recuperes depuis
	// /profiles/goals pour rester alignes avec le back-office.
	const suggestedCities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse'];
	let goalSuggestions = $state<Goal[]>([]);

	$effect(() => {
		getGoalsCatalog()
			.then((goals) => {
				goalSuggestions = goals ?? [];
			})
			.catch(() => {
				// Suggestions optionnelles : un echec ne doit pas bloquer la recherche.
			});
	});

	// Charge la liste complete au premier affichage (Option A : parcourir
	// tout le monde par defaut, la recherche/les chips filtrent en place).
	$effect(() => {
		runSearch();
	});

	// Combine le texte tape et au plus une ville + un objectif en une seule
	// requete. Chaque groupe (ville, objectif) est exclusif — un seul choix
	// actif a la fois — pour eviter les combinaisons impossibles (ex : deux
	// villes en meme temps, qui ne donneraient jamais de resultat).
	function buildQuery(): string {
		const parts = [query.trim(), selectedCity, selectedGoal].filter(Boolean) as string[];
		return parts.join(' ');
	}

	function onInput() {
		if (debounceHandle) clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => runSearch(), 300);
	}

	function toggleCity(city: string) {
		if (debounceHandle) clearTimeout(debounceHandle);
		selectedCity = selectedCity === city ? null : city;
		runSearch();
	}

	function toggleGoal(goalLabel: string) {
		if (debounceHandle) clearTimeout(debounceHandle);
		selectedGoal = selectedGoal === goalLabel ? null : goalLabel;
		runSearch();
	}

	function clearFilters() {
		if (debounceHandle) clearTimeout(debounceHandle);
		query = '';
		selectedCity = null;
		selectedGoal = null;
		runSearch();
	}

	// runSearch revient toujours a la page 1 (nouveau texte/filtre = nouveau
	// resultat, l'ancienne position de pagination n'a plus de sens).
	async function runSearch() {
		await fetchPage(0);
	}

	// goToPage remplace le contenu affiche (vraie pagination), contrairement
	// a un "charger plus" qui aurait accumule les resultats.
	async function goToPage(page: number) {
		if (page < 0) return;
		await fetchPage(page * limit);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function fetchPage(newOffset: number) {
		const q = buildQuery();
		const currentRequest = ++requestId;
		// Pas de "loading = true" qui vide l'ecran : on garde les anciens
		// resultats affiches jusqu'a ce que les nouveaux arrivent, pour
		// eviter le flash skeleton -> resultats a chaque frappe.
		loading = true;
		searchError = null;

		try {
			const res = await searchProfiles(q, { limit, offset: newOffset });
			if (currentRequest !== requestId) return; // reponse perimee, ignoree
			results = res.results;
			total = res.total;
			offset = newOffset;
		} catch (err) {
			if (currentRequest !== requestId) return;
			searchError = err instanceof Error ? err.message : 'Impossible de charger les membres';
		} finally {
			if (currentRequest === requestId) loading = false;
		}
	}

	// Crée (ou récupère, si elle existe déjà — géré côté backend par
	// FindDirectBetween) la conversation DM avec ce membre, puis redirige
	// directement vers le fil.
	async function contactMember(e: MouseEvent, member: SearchProfile) {
		e.preventDefault();
		e.stopPropagation(); // la carte entière est un <a>, on ne veut pas naviguer vers le profil

		if (contactingId) return; // déjà une création en cours

		contactingId = member.user_id;
		contactError = null;

		try {
			const conv = await createConversation({ participant_id: member.user_id });
			await goto(`/messages/${conv.id}`);
		} catch (err) {
			contactError = 'Impossible de démarrer la conversation';
			contactingId = null;
		}
	}

	let hasActiveFilters = $derived(query.trim() !== '' || selectedCity !== null || selectedGoal !== null);
	let currentPage = $derived(Math.floor(offset / limit));
	let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

	// Fenetre de pages affichees autour de la page courante (+ premiere et
	// derniere toujours visibles), avec des trous marques par null.
	let pageWindow = $derived.by(() => {
		const pages: (number | null)[] = [];
		const add = (p: number) => {
			if (!pages.includes(p)) pages.push(p);
		};

		add(0);
		for (let p = currentPage - 1; p <= currentPage + 1; p++) {
			if (p > 0 && p < totalPages - 1) add(p);
		}
		if (totalPages > 1) add(totalPages - 1);

		pages.sort((a, b) => a - b);

		const withGaps: (number | null)[] = [];
		for (let i = 0; i < pages.length; i++) {
			if (i > 0 && pages[i] - pages[i - 1] > 1) withGaps.push(null);
			withGaps.push(pages[i]);
		}
		return withGaps;
	});
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
			<p class="subtitle">Parcours tous les membres ou filtre par ville, objectif ou pseudo.</p>
		</header>

		<div class="search-bar">
			<SearchIcon size={16} strokeWidth={2} class="search-bar__icon" />
			<input
				type="text"
				placeholder="Ex : jean.dupont, Paris, augmenter mes revenus…"
				bind:value={query}
				oninput={onInput}
			/>
		</div>

		<div class="suggestions">
			{#if suggestedCities.length > 0}
				<div class="suggestions__group">
					<span class="suggestions__label">Ville</span>
					<div class="suggestions__chips">
						{#each suggestedCities as city (city)}
							<button
								type="button"
								class="chip"
								class:chip--active={selectedCity === city}
								onclick={() => toggleCity(city)}
							>
								{city}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if goalSuggestions.length > 0}
				<div class="suggestions__group">
					<span class="suggestions__label">Objectif</span>
					<div class="suggestions__chips">
						{#each goalSuggestions as goal (goal.id)}
							<button
								type="button"
								class="chip"
								class:chip--active={selectedGoal === goal.label}
								onclick={() => toggleGoal(goal.label)}
							>
								{goal.label}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if hasActiveFilters}
				<button type="button" class="clear-filters" onclick={clearFilters}>
					<XIcon size={12} strokeWidth={2} />
					<span>Réinitialiser</span>
				</button>
			{/if}
		</div>

		<div class="results-header">
			{#if !loading}
				<span class="results-count">{total} membre{total > 1 ? 's' : ''}</span>
			{/if}
		</div>

		{#if loading && results.length === 0}
			<div class="member-grid">
				{#each Array(6) as _}
					<div class="skeleton-card">
						<div class="skeleton-portrait"></div>
						<div class="skeleton-line" style="width: 70%"></div>
						<div class="skeleton-line" style="width: 45%"></div>
					</div>
				{/each}
			</div>
		{:else if searchError}
			<div class="empty-state">
				<p class="empty-state__title">Une erreur est survenue</p>
				<p class="empty-state__body">{searchError}</p>
			</div>
		{:else if results.length === 0}
			<div class="empty-state">
				<p class="empty-state__title">Aucun membre trouvé</p>
				<p class="empty-state__body">Essaie un autre terme ou retire un filtre.</p>
			</div>
		{:else}
			<div class="member-grid" class:member-grid--refreshing={loading}>
				{#each results as member (member.user_id)}
					<a href="/profile/{member.username}" class="member-card">
						<div class="member-card__portrait">
							{#if member.avatar_url}
								<img src={member.avatar_url} alt={member.username} loading="lazy" />
							{:else}
								<span class="member-card__initial">{member.username.charAt(0).toUpperCase()}</span>
							{/if}

							<button
								type="button"
								class="member-card__contact"
								disabled={contactingId === member.user_id}
								onclick={(e) => contactMember(e, member)}
								aria-label="Contacter {member.username}"
							>
								<MessageCircleIcon size={14} strokeWidth={2} />
							</button>
						</div>
						<div class="member-card__info">
							<span class="member-card__name">{member.username}</span>
							{#if member.location}
								<span class="member-card__location">{member.location}</span>
							{/if}
							{#if member.goals.length > 0}
								<span class="member-card__role">{member.goals[0].label}</span>
							{/if}
						</div>
					</a>
				{/each}
			</div>

			{#if contactError}
				<p class="contact-error">{contactError}</p>
			{/if}

			{#if totalPages > 1}
				<nav class="pagination" aria-label="Pagination des membres">
					<button
						type="button"
						class="pagination__arrow"
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 0 || loading}
						aria-label="Page précédente"
					>
						<ChevronLeftIcon size={16} strokeWidth={2} />
					</button>

					{#each pageWindow as page, i (i)}
						{#if page === null}
							<span class="pagination__ellipsis">…</span>
						{:else}
							<button
								type="button"
								class="pagination__page"
								class:pagination__page--active={page === currentPage}
								onclick={() => goToPage(page)}
								disabled={loading}
								aria-current={page === currentPage ? 'page' : undefined}
							>
								{page + 1}
							</button>
						{/if}
					{/each}

					<button
						type="button"
						class="pagination__arrow"
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage >= totalPages - 1 || loading}
						aria-label="Page suivante"
					>
						<ChevronRightIcon size={16} strokeWidth={2} />
					</button>
				</nav>
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
		max-width: 900px;
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

	@media (max-width: 860px) {
    .search-bar input{
        font-size: 16px;
    }}

	.search-bar input::placeholder {
		color: var(--muted);
	}

	.suggestions {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		margin-top: 1.25rem;
	}
	.suggestions__group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.suggestions__label {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.suggestions__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.chip {
		padding: 0.4rem 0.85rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
	}
	.chip:hover {
		border-color: var(--fg);
	}
	.chip--active {
		background: var(--fg);
		border-color: var(--fg);
		color: #fff;
	}

	.clear-filters {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: none;
		border: none;
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.2rem 0;
	}
	.clear-filters:hover {
		color: var(--fg);
	}

	.results-header {
		margin-top: 1.5rem;
		min-height: 1.1rem;
	}
	.results-count {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.member-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem 1rem;
		margin-top: 0.75rem;
	}
	@media (min-width: 480px) {
		.member-grid { grid-template-columns: repeat(3, 1fr); }
	}
	@media (min-width: 640px) {
		.member-grid { gap: 2rem 1.5rem; }
	}
	.member-grid--refreshing {
		opacity: 0.6;
		transition: opacity 0.15s ease;
	}

	.member-card {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
	}

	.member-card__portrait {
		position: relative;
		aspect-ratio: 3 / 4;
		background: #eeece6;
		overflow: hidden;
		filter: grayscale(1);
		transition: filter 0.3s ease;
	}
	.member-card:hover .member-card__portrait {
		filter: grayscale(0);
	}
	.member-card__portrait img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.member-card__initial {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 2rem;
		color: var(--muted);
	}

	.member-card__contact {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid var(--border);
		color: var(--fg);
		cursor: pointer;
		opacity: 0;
		transform: translateY(4px);
		transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease;
	}
	.member-card:hover .member-card__contact,
	.member-card:focus-within .member-card__contact {
		opacity: 1;
		transform: translateY(0);
	}
	.member-card__contact:hover:not(:disabled) {
		background: var(--fg);
		color: #fff;
	}
	.member-card__contact:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	/* toujours visible sur mobile (pas de hover) */
	@media (hover: none) {
		.member-card__contact {
			opacity: 1;
			transform: none;
			background: rgba(255, 255, 255, 0.85);
		}
	}

	.contact-error {
		margin-top: 1rem;
		text-align: center;
		font-size: 0.8rem;
		color: #b3402e;
	}

	.member-card__info {
		margin-top: 0.65rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.member-card__name {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 0.92rem;
		line-height: 1.25;
	}
	.member-card__location {
		font-size: 0.68rem;
		letter-spacing: 0.03em;
		color: var(--muted);
		text-transform: uppercase;
	}
	.member-card__role {
		font-size: 0.7rem;
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

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 2rem;
	}
	.pagination__arrow,
	.pagination__page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 0.5rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
	}
	.pagination__arrow:hover:not(:disabled),
	.pagination__page:hover:not(:disabled) {
		border-color: var(--fg);
	}
	.pagination__arrow:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.pagination__page--active {
		background: var(--fg);
		border-color: var(--fg);
		color: #fff;
	}
	.pagination__ellipsis {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		height: 2.25rem;
		color: var(--muted);
		font-size: 0.78rem;
	}

	.skeleton-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.skeleton-portrait {
		aspect-ratio: 3 / 4;
		background: #eeece6;
		position: relative;
		overflow: hidden;
	}
	.skeleton-portrait::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
		animation: skeleton-shimmer 1.6s ease-in-out infinite;
	}
	@keyframes skeleton-shimmer {
		to { transform: translateX(100%); }
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton-portrait::after { animation: none; }
	}
	.skeleton-line {
		height: 0.55rem;
		background: #eeece6;
	}
</style>