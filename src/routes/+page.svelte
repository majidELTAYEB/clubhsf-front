<!-- <script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// `page.data.user` plutôt que le store `authState` (state de module, partagé
	// par tout le processus serveur — voir la correction faite plus tôt sur la
	// sidebar) : ici c'est scopé par requête, donc fiable en SSR concurrent et
	// sans flash au premier rendu.
	let isAuthenticated = $derived(page.data.user !== null);

	$effect(() => {
		if (isAuthenticated) {
			goto(resolve('/masterclass'));
		}
	});
</script>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Hacker son Futur</span>
	</div>

	<main class="stage">
		<div class="pane">
			<span class="eyebrow">Connexion</span>
			<h1 class="title">Accédez à votre espace</h1>
			<p class="subtitle">
				Masterclass, lives et contenus exclusifs — tout ce qu'il vous faut pour progresser, au même endroit.
			</p>

			<div class="status">
				<span class="status__dot"></span>
				<span>Non connecté</span>
			</div>

			<a class="btn" href={resolve('/auth/login')}>Se connecter</a>

			<div class="divider">
				<span>Pas encore de compte ?</span>
			</div>

			<a class="btn btn--secondary" href={resolve('/auth/register')}>Créer un compte</a>
		</div>
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
	}

	/* Masthead — bleed pleine largeur, cohérent avec le reste du site */
	.masthead {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.masthead__eyebrow {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 0.95rem;
	}

	/* Stage — hero centré, pleine hauteur */
	.stage {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
	}

	.pane {
		width: 100%;
		max-width: 420px;
		text-align: center;
	}

	.eyebrow {
		display: block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 1rem;
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 2.6rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
	}

	.subtitle {
		margin-top: 0.85rem;
		font-size: 0.92rem;
		line-height: 1.6;
		color: var(--muted);
	}

	/* Statut — pastille neutre, pas de pulse (contrairement au "En direct" ailleurs
	   sur le site, ici c'est un état passif, pas un live) */
	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--border);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--muted);
	}

	.status__dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: var(--muted);
	}

	.btn {
		display: block;
		width: 100%;
		margin-top: 1.5rem;
		padding: 0.85rem 1rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-decoration: none;
		text-align: center;
		transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
	}
	.btn:hover {
		opacity: 0.85;
	}

	/* Bouton secondaire — inversé, pour bien distinguer inscription de connexion
	   sans introduire une nouvelle couleur (on reste sur fg/bg du thème) */
	.btn--secondary {
		margin-top: 0;
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--border);
	}
	.btn--secondary:hover {
		opacity: 1;
		background: var(--bg);
		border-color: var(--fg);
	}

	/* Séparateur texte entre les deux actions, pour clarifier l'intention
	   ("pas de compte ? inscrivez-vous" plutôt que deux boutons ambigus) */
	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1.75rem;
		margin-bottom: 1rem;
		font-size: 0.78rem;
		color: var(--muted);
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}
</style> -->

<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// `page.data.user` plutôt que le store `authState` (state de module, partagé
	// par tout le processus serveur — voir la correction faite plus tôt sur la
	// sidebar) : ici c'est scopé par requête, donc fiable en SSR concurrent et
	// sans flash au premier rendu.
	let isAuthenticated = $derived(page.data.user !== null);

	$effect(() => {
		if (isAuthenticated) {
			goto(resolve('/masterclass'));
		}
	});
</script>

<div class="page">
	<header class="bar">
		<span class="bar__brand">Hacker son Futur</span>
		<span class="bar__status">
			<span class="bar__dot"></span>
			Non connecté
		</span>
	</header>

	<main class="hero">
		<h1 class="title">
			<span class="line"><span class="line__in">Accédez</span></span>
			<span class="line"><span class="line__in">à votre</span></span>
			<span class="line"><span class="line__in">espace.</span></span>
		</h1>

		<div class="lower">
			<p class="lede">
				Masterclass, lives et contenus exclusifs — tout ce qu'il vous faut pour progresser, au même
				endroit.
			</p>

			<nav class="actions" aria-label="Authentification">
				<a class="row" href={resolve('/auth/login')}>
					<span class="row__label">Se connecter</span>
					<span class="row__hint">J'ai déjà un compte</span>
					<svg class="row__icon" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M6 18 18 6M8 6h10v10" />
					</svg>
				</a>
				<a class="row" href={resolve('/auth/register')}>
					<span class="row__label">Créer un compte</span>
					<span class="row__hint">Première visite</span>
					<svg class="row__icon" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M6 18 18 6M8 6h10v10" />
					</svg>
				</a>
			</nav>
		</div>
	</main>

	<footer class="index">
		<div class="index__cell">
			<span class="index__name">Masterclass</span>
			<span class="index__desc">Des formations complètes, à suivre à votre rythme</span>
		</div>
		<div class="index__cell">
			<span class="index__name">Lives</span>
			<span class="index__desc">Des sessions en direct avec la communauté</span>
		</div>
		<div class="index__cell">
			<span class="index__name">Contenus exclusifs</span>
			<span class="index__desc">Réservés aux membres</span>
		</div>
	</footer>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	.page {
		--bg: #ffffff;
		--fg: #000000;
		--muted: #6a6a6a;
		--rule: #000000;
		--pad: clamp(1.25rem, 3.5vw, 2.5rem);

		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
	}

	/* Barre du haut — marque à gauche, état de session à droite */
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem var(--pad);
		border-bottom: 1px solid var(--rule);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.bar__brand {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}

	/* État passif : pastille pleine, pas de pulse (réservé au "En direct" ailleurs) */
	.bar__status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted);
	}

	.bar__dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
		background: var(--muted);
	}

	/* Hero — le titre est l'élément mémorable de la page */
	.hero {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: clamp(2rem, 6vw, 4rem);
		padding: clamp(2rem, 5vw, 4rem) var(--pad);
	}

	.title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 800;
		font-size: clamp(3.75rem, 15vw, 13rem);
		line-height: 0.88;
		letter-spacing: -0.045em;
	}

	/* Chaque ligne est masquée puis révélée : une seule animation, au chargement */
	.line {
		display: block;
		overflow: hidden;
		padding-bottom: 0.06em;
	}

	.line__in {
		display: inline-block;
		transform: translateY(105%);
		animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}
	.line:nth-child(2) .line__in {
		animation-delay: 0.08s;
	}
	.line:nth-child(3) .line__in {
		animation-delay: 0.16s;
	}

	@keyframes rise {
		to {
			transform: translateY(0);
		}
	}

	.lower {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: end;
	}

	.lede {
		max-width: 34ch;
		font-size: clamp(1.05rem, 1.6vw, 1.3rem);
		line-height: 1.45;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	/* Actions présentées comme des entrées d'annuaire : lignes pleine largeur */
	.actions {
		border-top: 1px solid var(--rule);
	}

	.row {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'label icon'
			'hint icon';
		align-items: center;
		column-gap: 1rem;
		padding: 1.1rem 0.25rem;
		border-bottom: 1px solid var(--rule);
		color: var(--fg);
		text-decoration: none;
		transition:
			background-color 0.2s ease,
			color 0.2s ease,
			padding 0.2s ease;
	}

	.row__label {
		grid-area: label;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 2.2rem);
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	.row__hint {
		grid-area: hint;
		margin-top: 0.2rem;
		font-size: 0.9rem;
		color: var(--muted);
		transition: color 0.2s ease;
	}

	.row__icon {
		grid-area: icon;
		width: 1.75rem;
		height: 1.75rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.75;
		stroke-linecap: square;
		transition: transform 0.25s ease;
	}

	.row:hover,
	.row:focus-visible {
		background: var(--fg);
		color: var(--bg);
		padding-left: 1rem;
		padding-right: 1rem;
		outline: none;
	}
	.row:hover .row__hint,
	.row:focus-visible .row__hint {
		color: #bdbdbd;
	}
	.row:hover .row__icon,
	.row:focus-visible .row__icon {
		transform: translate(3px, -3px);
	}

	/* Index bas de page — rappelle ce qu'il y a derrière la porte */
	.index {
		display: grid;
		grid-template-columns: 1fr;
		border-top: 1px solid var(--rule);
	}

	.index__cell {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 1.1rem var(--pad);
		border-bottom: 1px solid var(--rule);
	}
	.index__cell:last-child {
		border-bottom: none;
	}

	.index__name {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}

	.index__desc {
		font-size: 0.88rem;
		line-height: 1.4;
		color: var(--muted);
	}

	@media (min-width: 768px) {
		.lower {
			grid-template-columns: 1fr minmax(320px, 520px);
			gap: 4rem;
		}

		.index {
			grid-template-columns: repeat(3, 1fr);
		}

		.index__cell {
			border-bottom: none;
			border-right: 1px solid var(--rule);
		}
		.index__cell:last-child {
			border-right: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.line__in {
			animation: none;
			transform: none;
		}
		.row,
		.row__icon {
			transition: none;
		}
	}
</style>