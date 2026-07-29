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
		transition: opacity 0.2s ease;
	}
	.btn:hover {
		opacity: 0.85;
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
</style>