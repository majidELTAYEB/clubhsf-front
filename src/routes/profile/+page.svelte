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
	import NotificationPrompt from "$lib/components/NotificationPrompt.svelte";
	import NotificationCenter from "$lib/features/notifications/components/NotificationCenter.svelte";

	let profile = $state<Profile | null>(null);
	let goalsCatalog = $state<Goal[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

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
		<span class="masthead__brand">Profil</span>
		<div class="masthead__right">
			<NotificationCenter />
		</div>
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
				<PencilIcon size={14} strokeWidth={1.75} />
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
					<PencilIcon size={14} strokeWidth={1.75} />
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
					<span class="section__label">Objectifs</span>
					<button
						type="button"
						class="section__edit"
						onclick={(e) => openModal('goals', e.currentTarget)}
						aria-label="Modifier les objectifs"
					>
						<PencilIcon size={13} strokeWidth={1.75} />
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
					<XIcon size={18} strokeWidth={1.75} />
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
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		min-height: 100%;
	}

	.archive a:focus-visible,
	.archive button:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: 2px;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		padding-top: calc(1rem + env(safe-area-inset-top));
		border-bottom: 1px solid var(--rule);
		justify-content: space-between;
	}
	.masthead__brand {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}
	.masthead__right {
		display: flex;
		align-items: center;
	}

	.archive__inner {
		max-width: 760px;
		margin: 0 auto;
		padding: 2rem 1.5rem 6rem;
	}

	.empty-state {
		margin-top: 1.5rem;
		padding: 4rem 0;
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
	}
	.empty-state__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.3rem;
		letter-spacing: -0.02em;
	}
	.empty-state__body { margin-top: 0.4rem; font-size: 0.88rem; color: var(--muted); }

	/* Skeleton */
	.skeleton-cover,
	.skeleton-avatar,
	.skeleton-line,
	.skeleton-button,
	.skeleton-chip {
		position: relative;
		background: #ececec;
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
		border-bottom: 1px solid var(--rule);
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

	.skeleton-line { height: 0.75rem; }
	.skeleton-line--username { width: 40%; height: 1.6rem; }
	.skeleton-line--meta { width: 55%; }
	.skeleton-line--bio { width: 90%; margin-top: 1.5rem; height: 0.85rem; }
	.skeleton-line--bio-short { width: 60%; margin-top: 0.6rem; }
	.skeleton-line--eyebrow { width: 5rem; height: 0.6rem; margin-bottom: 0.9rem; }

	.skeleton-button {
		width: 100%;
		height: 2.5rem;
	}
	@media (min-width: 640px) {
		.skeleton-button { width: 10rem; margin-bottom: 0.4rem; }
	}

	.skeleton-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}
	.skeleton-chip { width: 5rem; height: 1.8rem; }
	.skeleton-chip--square { width: 6rem; height: 2.2rem; }

	.skeleton-section {
		margin-top: 2rem;
		padding-top: 1.75rem;
		border-top: 1px solid var(--rule);
	}

	/* Cover */
	.cover {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 5;
		background: #eee;
		overflow: hidden;
		border-bottom: 1px solid var(--rule);
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
		background: #fff;
		border: 1px solid var(--rule);
		cursor: pointer;
		color: var(--fg);
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.cover-edit:hover { background: var(--fg); color: #fff; }

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
		outline: 1px solid var(--rule);
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--fg);
	}
	@media (min-width: 640px) {
		.avatar { width: 6rem; height: 6rem; font-size: 1.3rem; }
	}
	.avatar img { width: 100%; height: 100%; object-fit: cover; }

	.profile-head__text { flex: 1; min-width: 0; padding-bottom: 0.2rem; }
	@media (min-width: 640px) {
		.profile-head__text { padding-bottom: 0.4rem; }
	}

	.username {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(1.6rem, 5vw, 2.2rem);
		line-height: 1.05;
		letter-spacing: -0.03em;
		word-break: break-word;
	}

	.member-since {
		display: block;
		margin-top: 0.4rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.edit-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		width: 100%;
		padding: 0.7rem 1rem;
		background: var(--bg);
		border: 1px solid var(--rule);
		font-family: 'Hanken Grotesk', sans-serif;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--fg);
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	@media (min-width: 640px) {
		.edit-button {
			width: auto;
			padding: 0.6rem 1rem;
			margin-bottom: 0.4rem;
		}
	}
	.edit-button:hover { background: var(--fg); color: #fff; }

	.bio {
		margin-top: 1.5rem;
		font-size: 1.02rem;
		font-weight: 500;
		line-height: 1.6;
		color: #222;
		max-width: 56ch;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		margin-top: 1.1rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
	}
	.meta-item--link { color: var(--fg); text-decoration: none; }
	.meta-item--link:hover { text-decoration: underline; text-underline-offset: 3px; }

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
		padding: 0.45rem 0.85rem;
		border: 1px solid var(--rule);
		text-decoration: none;
		color: var(--fg);
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: capitalize;
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.social-chip:hover { background: var(--fg); color: #fff; }

	.section {
		margin-top: 2rem;
		padding-top: 1.75rem;
		border-top: 1px solid var(--rule);
	}
	.section__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	.section__label {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.1rem;
		letter-spacing: -0.02em;
	}
	.section__edit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.1rem;
		height: 2.1rem;
		background: none;
		border: 1px solid var(--rule);
		cursor: pointer;
		color: var(--fg);
		transition: background-color 0.2s ease, color 0.2s ease;
	}
	.section__edit:hover { background: var(--fg); color: #fff; }
	.section__empty { font-size: 0.85rem; color: var(--muted); }

	.goals-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.goal-chip {
		padding: 0.45rem 0.85rem;
		border: 1px solid var(--rule);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--fg);
	}

	/* Modale — bottom sheet mobile, boîte centrée desktop */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
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
		.modal-wrap { align-items: center; padding: 1.5rem; }
	}

	.modal {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		width: 100%;
		max-width: 100%;
		max-height: 88vh;
		background: var(--bg);
		color: var(--fg);
		border-top: 1px solid var(--rule);
		display: flex;
		flex-direction: column;
		font-family: 'Hanken Grotesk', sans-serif;
		pointer-events: auto;
		padding-bottom: env(safe-area-inset-bottom);
	}
	@media (min-width: 640px) {
		.modal {
			max-width: 480px;
			max-height: 85vh;
			border: 1px solid var(--rule);
			padding-bottom: 0;
		}
	}

	.modal__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 1.25rem;
		border-bottom: 1px solid var(--rule);
		flex-shrink: 0;
	}
	@media (min-width: 640px) {
		.modal__head { padding: 1.25rem 1.5rem; }
	}

	.modal__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.2rem;
		letter-spacing: -0.03em;
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
		color: var(--fg);
		margin: -0.4rem;
		transition: opacity 0.2s ease;
	}
	.modal__close:hover { opacity: 0.55; }

	.modal__body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}
	@media (min-width: 640px) {
		.modal__body { padding: 1.5rem; }
	}
</style>