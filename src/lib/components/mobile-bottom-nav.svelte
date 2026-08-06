<!-- src/lib/components/mobile-bottom-nav.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import Videotape from "@lucide/svelte/icons/videotape";
	import UserRound from "@lucide/svelte/icons/user-round";
    import LibraryIcon from "@lucide/svelte/icons/library";
    	import Webcam from "@lucide/svelte/icons/webcam";

	const items = [
		{ href: '/masterclass', label: 'Masterclass', icon: LibraryIcon },
		{ href: '/lives', label: 'Lives', icon: Webcam },
		{ href: '/livestreams-replays', label: 'Replays', icon: Videotape },
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
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 90;
		background: var(--bg);
		border-top: 1px solid var(--border);
		padding-bottom: env(safe-area-inset-bottom);
		font-family: 'Inter', sans-serif;
	}

	/* Uniquement sur mobile — la sidebar reste la navigation sur desktop */
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

	/* Feedback tactile immédiat au tap — essentiel pour une bottom nav mobile,
	   sinon le doigt masque l'icône et rien ne confirme le clic. */
	.bottom-nav__item:active .bottom-nav__icon {
		transform: scale(0.9);
	}

	.bottom-nav__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.15rem;
		height: 2.15rem;
		border: 1px solid transparent;
		color: var(--muted);
		transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.12s ease;
	}

	/* Même vocabulaire que les carrés d'objectifs du profil : sélectionné =
	   carré plein noir, non sélectionné = juste l'icône, pas de couleur accent. */
	.bottom-nav__item--active .bottom-nav__icon {
		background: var(--fg);
		border-color: var(--fg);
		color: #fff;
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