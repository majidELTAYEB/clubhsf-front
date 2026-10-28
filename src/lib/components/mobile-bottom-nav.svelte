<!-- src/lib/components/mobile-bottom-nav.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import UserRound from "@lucide/svelte/icons/user-round";
	import LibraryIcon from "@lucide/svelte/icons/library";
	import Webcam from "@lucide/svelte/icons/webcam";
	import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
	import UsersRound from "@lucide/svelte/icons/users-round";
	import { unreadStore } from '$lib/features/messaging/unread.svelte';

	const items = [
		{ href: '/masterclass', label: 'Masterclass', icon: LibraryIcon },
		{ href: '/lives', label: 'Lives', icon: Webcam },
		{ href: '/community/posts', label: 'Communauté', icon: UsersRound },
		{ href: '/messages', label: 'Messages', icon: MessageCircleIcon },
		{ href: '/profile', label: 'Profil', icon: UserRound },
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<nav class="bottom-nav" aria-label="Navigation principale">
	{#each items as item (item.href)}
		{@const active = isActive(item.href)}
		<a
			href={item.href}
			class="bottom-nav__item"
			class:bottom-nav__item--active={active}
			aria-current={active ? 'page' : undefined}
		>
			<span class="bottom-nav__icon">
				<item.icon size={18} strokeWidth={active ? 2 : 1.6} />
				{#if item.href === '/messages' && unreadStore.hasUnread}
					<span class="bottom-nav__dot" aria-label="Nouveaux messages"></span>
				{/if}
			</span>
			<span class="bottom-nav__label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600&display=swap');

	.bottom-nav {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;

		display: none;
		/* position: fixed; */
		/* bottom: 0;
		left: 0;
		right: 0;
		z-index: 90; */
		flex-shrink: 0;
		background: var(--bg);
		border-top: 1px solid var(--rule);
		/* padding-bottom: env(safe-area-inset-bottom); */
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}

	@media (max-width: 767px) {
		.bottom-nav {
			display: flex;
			align-items: stretch;
			justify-content: space-around;
		}
	}

	/* Chaque entrée est une cellule séparée par un filet noir ;
	   l'entrée active s'inverse en noir, comme les lignes d'annuaire au survol */
	.bottom-nav__item {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.7rem 0.25rem 0.65rem;
		color: var(--muted);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		transition: background-color 0.18s ease, color 0.18s ease;
	}
	.bottom-nav__item + .bottom-nav__item {
		border-left: 1px solid var(--rule);
	}
	.bottom-nav__item:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: -4px;
	}

	.bottom-nav__item:active .bottom-nav__icon {
		transform: scale(0.9);
	}

	.bottom-nav__icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 1.5rem;
		transition: transform 0.12s ease;
	}

	.bottom-nav__item--active {
		background: var(--fg);
		color: #fff;
	}

	/* Pastille "non lu" : noire au repos, blanche sur la cellule active */
	.bottom-nav__dot {
		position: absolute;
		top: -0.1rem;
		right: -0.35rem;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--fg);
		border: 1.5px solid var(--bg);
	}
	.bottom-nav__item--active .bottom-nav__dot {
		background: #fff;
		border-color: var(--fg);
	}

	.bottom-nav__label {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		line-height: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.bottom-nav__item,
		.bottom-nav__icon {
			transition: none;
		}
	}
</style>