<script lang="ts">
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import XIcon from "@lucide/svelte/icons/x";
	import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { getProfile, getGoalsCatalog } from '$lib/features/profile/api';
	import type { Profile, Goal } from '$lib/features/profile/types';
	import ProfileCoverEditor from '$lib/features/profile/components/profile-cover-editor.svelte';
	import ProfileInfoEditor from '$lib/features/profile/components/profile-info-editor.svelte';
	import ProfileGoalsEditor from '$lib/features/profile/components/profile-goals-editor.svelte';

	let profile = $state<Profile | null>(null);
	let goalsCatalog = $state<Goal[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	// Un seul drawer à la fois — 'cover' | 'info' | 'goals' | null.
	// Un seul "châssis" de drawer (overlay/animation/fermeture) partagé par les 3,
	// mais un seul composant d'édition rendu dedans selon le bouton cliqué.
	type DrawerKind = 'cover' | 'info' | 'goals' | null;
	let activeDrawer = $state<DrawerKind>(null);

	const DRAWER_TITLES: Record<Exclude<DrawerKind, null>, string> = {
		cover: 'Modifier les photos',
		info: 'Modifier le profil',
		goals: 'Modifier les objectifs'
	};

	async function loadProfile() {
		try {
			profile = await getProfile();
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Impossible de charger le profil';
		}
	}

	async function loadAll() {
		loading = true;
		loadError = null;
		try {
			await Promise.all([loadProfile(), (async () => { goalsCatalog = await getGoalsCatalog(); })()]);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadAll();
	});

	// --- UX de la modale ---
	let modalRef: HTMLElement | undefined = $state();
	let lastTriggerRef: HTMLButtonElement | undefined = $state();

	function openModal(kind: Exclude<DrawerKind, null>, trigger: HTMLButtonElement) {
		activeDrawer = kind;
		lastTriggerRef = trigger;
	}
	function closeModal() {
		activeDrawer = null;
		lastTriggerRef?.focus();
	}

	$effect(() => {
		if (!activeDrawer) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		queueMicrotask(() => {
			modalRef?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
		});

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeModal();
		}
		window.addEventListener('keydown', handleKeydown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function initials(name: string | undefined | null) {
		return (name ?? '').trim().slice(0, 2).toUpperCase() || '?';
	}
</script>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Profil</span>
	</div>

	{#if loading}
		<div class="skeleton-cover"></div>
		<div class="archive__inner">
			<div class="skeleton-head">
				<div class="skeleton-avatar"></div>
				<div class="skeleton-head__text">
					<div class="skeleton-line skeleton-line--username"></div>
					<div class="skeleton-line skeleton-line--meta"></div>
				</div>
				<div class="skeleton-button"></div>
			</div>

			<div class="skeleton-line skeleton-line--bio"></div>
			<div class="skeleton-line skeleton-line--bio skeleton-line--bio-short"></div>

			<div class="skeleton-chips">
				<div class="skeleton-chip"></div>
				<div class="skeleton-chip"></div>
				<div class="skeleton-chip"></div>
			</div>

			<div class="skeleton-section">
				<div class="skeleton-line skeleton-line--eyebrow"></div>
				<div class="skeleton-chips">
					<div class="skeleton-chip skeleton-chip--square"></div>
					<div class="skeleton-chip skeleton-chip--square"></div>
					<div class="skeleton-chip skeleton-chip--square"></div>
				</div>
			</div>
		</div>
	{:else if loadError || !profile}
		<div class="archive__inner">
			<div class="empty-state">
				<p class="empty-state__title">Impossible de charger le profil</p>
				{#if loadError}<p class="empty-state__body">{loadError}</p>{/if}
			</div>
		</div>
	{:else}
		<!-- Cover — bouton d'édition contextuel en overlay -->
		<div class="cover">
			{#if profile.cover_image_url}
				<img src={profile.cover_image_url} alt="Couverture" />
			{/if}
			<button
				type="button"
				class="cover-edit"
				onclick={(e) => openModal('cover', e.currentTarget)}
				aria-label="Modifier les photos"
			>
				<PencilIcon size={13} strokeWidth={1.75} />
			</button>
		</div>

		<div class="archive__inner">
			<div class="profile-head">
				<div class="avatar">
					{#if profile.avatar_url}
						<img src={profile.avatar_url} alt={profile.username} />
					{:else}
						<span>{initials(profile.username)}</span>
					{/if}
				</div>

				<div class="profile-head__text">
					<h1 class="username">{profile.username}</h1>
					<span class="member-since">
						Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
					</span>
				</div>

				<button
					type="button"
					class="edit-button"
					onclick={(e) => openModal('info', e.currentTarget)}
				>
					<PencilIcon size={13} strokeWidth={1.75} />
					<span>Modifier le profil</span>
				</button>
			</div>

			{#if profile.bio}
				<p class="bio">{profile.bio}</p>
			{/if}

			<div class="meta-row">
				{#if profile.location}
					<span class="meta-item">{profile.location}</span>
				{/if}
				{#if profile.website_url}
					<a href={profile.website_url} target="_blank" class="meta-item meta-item--link">{profile.website_url}</a>
				{/if}
			</div>

			{#if (profile.social_links ?? []).length > 0}
				<div class="social-row">
					{#each profile.social_links ?? [] as link (link.platform)}
						<a href={link.url} target="_blank" class="social-chip">
							<ExternalLinkIcon size={13} strokeWidth={1.75} />
							<span>{link.platform}</span>
						</a>
					{/each}
				</div>
			{/if}

			<div class="section">
				<div class="section__head">
					<span class="eyebrow">Objectifs</span>
					<button
						type="button"
						class="section__edit"
						onclick={(e) => openModal('goals', e.currentTarget)}
						aria-label="Modifier les objectifs"
					>
						<PencilIcon size={12} strokeWidth={1.75} />
					</button>
				</div>
				{#if (profile.goals ?? []).length > 0}
					<div class="goals-row">
						{#each profile.goals ?? [] as goal (goal.id)}
							<span class="goal-chip">{goal.label}</span>
						{/each}
					</div>
				{:else}
					<p class="section__empty">Aucun objectif sélectionné.</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Châssis de modale partagé — un seul composant rendu à la fois selon activeDrawer -->
{#if activeDrawer && profile}
	<div class="modal-overlay" onclick={closeModal} transition:fade={{ duration: 180 }}></div>
	<div class="modal-wrap" transition:fade={{ duration: 150 }}>
		<div
			bind:this={modalRef}
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-label={DRAWER_TITLES[activeDrawer]}
			transition:fly={{ y: 24, duration: 220, easing: cubicOut }}
		>
			<div class="modal__head">
				<span class="modal__title">{DRAWER_TITLES[activeDrawer]}</span>
				<button type="button" class="modal__close" onclick={closeModal} aria-label="Fermer">
					<XIcon size={16} strokeWidth={1.75} />
				</button>
			</div>

			<div class="modal__body">
				{#if activeDrawer === 'cover'}
					<ProfileCoverEditor
						avatarUrl={profile.avatar_url}
						coverUrl={profile.cover_image_url}
						onUpdated={loadProfile}
					/>
				{:else if activeDrawer === 'info'}
					<ProfileInfoEditor
						username={profile.username}
						bio={profile.bio ?? ''}
						location={profile.location ?? ''}
						websiteUrl={profile.website_url ?? ''}
						socialLinks={profile.social_links ?? []}
						onUpdated={loadProfile}
					/>
				{:else if activeDrawer === 'goals'}
					<ProfileGoalsEditor
						{goalsCatalog}
						selectedGoalIds={(profile.goals ?? []).map((g) => g.id)}
						onUpdated={loadProfile}
						onClose={closeModal}
					/>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		min-height: 100%;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}
	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.archive__inner {
		max-width: 760px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	.empty-state {
		margin-top: 2.5rem;
		padding: 6rem 1rem;
		text-align: center;
		border: 1px dashed var(--border);
	}
	.empty-state__title { font-size: 0.9rem; font-weight: 500; }
	.empty-state__body { margin-top: 0.3rem; font-size: 0.82rem; color: var(--muted); }

	/* Skeleton de chargement — reprend la structure réelle de la page */
	.skeleton-cover,
	.skeleton-avatar,
	.skeleton-line,
	.skeleton-button,
	.skeleton-chip {
		position: relative;
		background: #eeece6;
		overflow: hidden;
	}
	.skeleton-cover::after,
	.skeleton-avatar::after,
	.skeleton-line::after,
	.skeleton-button::after,
	.skeleton-chip::after {
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
		.skeleton-cover::after,
		.skeleton-avatar::after,
		.skeleton-line::after,
		.skeleton-button::after,
		.skeleton-chip::after {
			animation: none;
		}
	}

	.skeleton-cover {
		width: 100%;
		aspect-ratio: 16 / 5;
	}

	.skeleton-head {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-top: -2.5rem;
		position: relative;
		z-index: 1;
	}
	@media (min-width: 640px) {
		.skeleton-head {
			flex-direction: row;
			align-items: flex-end;
			gap: 1.25rem;
			margin-top: -3rem;
		}
	}

	.skeleton-avatar {
		width: 4.75rem;
		height: 4.75rem;
		flex-shrink: 0;
		border: 3px solid var(--bg);
	}
	@media (min-width: 640px) {
		.skeleton-avatar { width: 6rem; height: 6rem; }
	}

	.skeleton-head__text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-line {
		height: 0.75rem;
	}
	.skeleton-line--username { width: 40%; height: 1.3rem; }
	.skeleton-line--meta { width: 55%; }
	.skeleton-line--bio { width: 90%; margin-top: 1.5rem; height: 0.85rem; }
	.skeleton-line--bio-short { width: 60%; margin-top: 0.6rem; }
	.skeleton-line--eyebrow { width: 5rem; height: 0.6rem; margin-bottom: 0.9rem; }

	.skeleton-button {
		width: 100%;
		height: 2.4rem;
	}
	@media (min-width: 640px) {
		.skeleton-button { width: 9rem; margin-bottom: 0.4rem; }
	}

	.skeleton-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}
	.skeleton-chip {
		width: 5rem;
		height: 1.7rem;
	}
	.skeleton-chip--square {
		width: 6rem;
		height: 2.2rem;
	}

	.skeleton-section {
		margin-top: 2rem;
		padding-top: 1.75rem;
		border-top: 1px solid var(--border);
	}

	/* Cover */
	.cover {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 5;
		background: #f1efe9;
		overflow: hidden;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.cover-edit {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid var(--border);
		cursor: pointer;
		transition: background 0.2s ease;
	}
	.cover-edit:hover { background: #fff; }

	.profile-head {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-top: -2.5rem;
		position: relative;
		z-index: 1;
	}

	@media (min-width: 640px) {
		.profile-head {
			flex-direction: row;
			align-items: flex-end;
			gap: 1.25rem;
			margin-top: -3rem;
		}
	}

	.avatar {
		width: 4.75rem;
		height: 4.75rem;
		flex-shrink: 0;
		border: 3px solid var(--bg);
		background: #f1efe9;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: 'JetBrains Mono', monospace;
		font-size: 1rem;
		font-weight: 500;
		color: var(--muted);
	}
	@media (min-width: 640px) {
		.avatar {
			width: 6rem;
			height: 6rem;
			font-size: 1.1rem;
		}
	}
	.avatar img { width: 100%; height: 100%; object-fit: cover; }

	.profile-head__text { flex: 1; min-width: 0; padding-bottom: 0.2rem; }

	@media (min-width: 640px) {
		.profile-head__text { padding-bottom: 0.4rem; }
	}

	.username {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.35rem, 5vw, 1.6rem);
		line-height: 1.2;
		word-break: break-word;
	}

	.member-since {
		display: block;
		margin-top: 0.3rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: var(--muted);
	}

	.edit-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		width: 100%;
		padding: 0.65rem 0.9rem;
		background: var(--bg);
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	@media (min-width: 640px) {
		.edit-button {
			width: auto;
			padding: 0.55rem 0.9rem;
			font-size: 0.75rem;
			margin-bottom: 0.4rem;
		}
	}
	.edit-button:hover { border-color: var(--fg); }

	.bio {
		margin-top: 1.5rem;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 1.02rem;
		line-height: 1.6;
		color: #2b2a26;
		max-width: 56ch;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--muted);
	}
	.meta-item--link { color: var(--accent); text-decoration: none; }
	.meta-item--link:hover { text-decoration: underline; }

	.social-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 1.25rem;
	}
	.social-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--border);
		text-decoration: none;
		color: var(--fg);
		font-size: 0.75rem;
		text-transform: capitalize;
		transition: border-color 0.2s ease;
	}
	.social-chip:hover { border-color: var(--fg); }

	.section {
		margin-top: 2rem;
		padding-top: 1.75rem;
		border-top: 1px solid var(--border);
	}
	.section__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.9rem;
	}
	.section__edit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: 1px solid var(--border);
		cursor: pointer;
		color: var(--muted);
		transition: border-color 0.2s ease, color 0.2s ease;
	}
	.section__edit:hover { border-color: var(--fg); color: var(--fg); }
	.section__empty {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.eyebrow {
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.goals-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.goal-chip {
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--border);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: var(--fg);
	}

	/* Modale — bottom sheet plein écran sur mobile, boîte centrée sur desktop */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(18, 18, 16, 0.4);
		z-index: 100;
	}

	.modal-wrap {
		position: fixed;
		inset: 0;
		z-index: 101;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0;
		pointer-events: none;
	}

	@media (min-width: 640px) {
		.modal-wrap {
			align-items: center;
			padding: 1.5rem;
		}
	}

	.modal {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		width: 100%;
		max-width: 100%;
		max-height: 88vh;
		background: var(--bg);
		border-top: 1px solid var(--border);
		box-shadow: 0 -8px 32px rgba(18, 18, 16, 0.14);
		display: flex;
		flex-direction: column;
		font-family: 'Inter', sans-serif;
		color: var(--fg);
		pointer-events: auto;
		padding-bottom: env(safe-area-inset-bottom);
	}

	@media (min-width: 640px) {
		.modal {
			max-width: 460px;
			max-height: 85vh;
			border: 1px solid var(--border);
			box-shadow: 0 24px 64px rgba(18, 18, 16, 0.18);
			padding-bottom: 0;
		}
	}

	.modal__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	@media (min-width: 640px) {
		.modal__head { padding: 1.25rem 1.5rem; }
	}

	.modal__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.05rem;
	}
	@media (min-width: 640px) {
		.modal__title { font-size: 1.1rem; }
	}

	.modal__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		margin: -0.4rem;
	}
	.modal__close:hover { color: var(--fg); }

	.modal__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}
	@media (min-width: 640px) {
		.modal__body { padding: 1.5rem; }
	}
</style>