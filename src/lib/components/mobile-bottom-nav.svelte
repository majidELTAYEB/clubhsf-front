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
		{ href: '/community/posts', label: 'Community', icon: UsersRound },
		{href: '/messages', label: 'Messages', icon: MessageCircleIcon },
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
				<item.icon size={17} strokeWidth={active ? 2 : 1.6} />
				{#if item.href === '/messages' && unreadStore.hasUnread}
					<span class="bottom-nav__dot" aria-label="Nouveaux messages"></span>
				{/if}
			</span>
			<span class="bottom-nav__label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

	.bottom-nav {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #9b978f;
		--border: #e6e3db;

		display: none;
		/* position: fixed; */
		/* bottom: 0;
		left: 0;
		right: 0;
		z-index: 90; */
		flex-shrink: 0;
		background: var(--bg);
		border-top: 1px solid var(--border);
		padding-bottom: env(safe-area-inset-bottom);
		font-family: 'Inter', sans-serif;
	}

	@media (max-width: 767px) {
		.bottom-nav {
			display: flex;
			align-items: stretch;
			justify-content: space-around;
		}
	}

	.bottom-nav__item {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		padding: 0.6rem 0.25rem 0.55rem;
		color: var(--muted);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		transition: color 0.15s ease;
	}

	.bottom-nav__item:active .bottom-nav__icon {
		transform: scale(0.9);
	}

	.bottom-nav__icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.15rem;
		height: 2.15rem;
		border: 1px solid transparent;
		color: var(--muted);
		transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.12s ease;
	}

	.bottom-nav__item--active .bottom-nav__icon {
		background: var(--fg);
		border-color: var(--fg);
		color: #fff;
	}

	.bottom-nav__dot {
		position: absolute;
		top: 0.15rem;
		right: 0.15rem;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: #e53e3e;
		border: 1.5px solid var(--bg);
	}

	.bottom-nav__label {
		font-size: 0.62rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.bottom-nav__item--active {
		color: var(--fg);
	}
	.bottom-nav__item--active .bottom-nav__label {
		font-weight: 600;
	}
</style>