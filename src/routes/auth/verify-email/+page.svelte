<!-- src/routes/auth/verify-email/+page.svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import MailIcon from "@lucide/svelte/icons/mail";

	let { data, form }: { data: { email: string | null }; form?: { error?: string; success?: boolean } } = $props();

	let loading = $state(false);
	let cooldown = $state(0);
	let cooldownInterval: ReturnType<typeof setInterval> | null = null;

	function startCooldown(seconds = 60) {
		cooldown = seconds;
		cooldownInterval = setInterval(() => {
			cooldown -= 1;
			if (cooldown <= 0 && cooldownInterval) {
				clearInterval(cooldownInterval);
				cooldownInterval = null;
			}
		}, 1000);
	}
</script>

<svelte:head>
	<title>Vérifie ton email</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Vérification</span>
	</div>

	<div class="archive__inner">
		<div class="card">
			<span class="card__icon">
				<MailIcon size={16} strokeWidth={1.75} />
			</span>

			<h1 class="title">Vérifie ta boîte mail</h1>
			<p class="body">
				{#if data.email}
					Un lien de vérification a été envoyé à <strong>{data.email}</strong>. Clique dessus
					pour activer ton compte.
				{:else}
					Un lien de vérification a été envoyé à ton adresse email. Clique dessus pour activer
					ton compte.
				{/if}
			</p>

			<form
				method="POST"
				action="?/resend"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							startCooldown();
						}
						await update();
					};
				}}
			>
				<button type="submit" class="resend-button" disabled={loading || cooldown > 0}>
					{#if loading}
						Envoi…
					{:else if cooldown > 0}
						Renvoyer ({cooldown}s)
					{:else}
						Renvoyer l'email
					{/if}
				</button>
			</form>

			{#if form?.error}
				<p class="message message--error">{form.error}</p>
			{:else if form?.success}
				<p class="message message--success">Email renvoyé.</p>
			{/if}

			<a href="/auth/login" class="secondary-link">Retour à la connexion</a>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

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

	.masthead {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.archive__inner {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.card {
		width: 100%;
		max-width: 400px;
		padding: 2.25rem 1.75rem;
		border: 1px solid var(--border);
		text-align: center;
	}

	.card__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		margin-bottom: 1.25rem;
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.5rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.body {
		margin-top: 0.6rem;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--muted);
	}
	.body strong {
		color: var(--fg);
		font-weight: 600;
	}

	.resend-button {
		width: 100%;
		margin-top: 1.75rem;
		padding: 0.75rem 1rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}
	.resend-button:hover:not(:disabled) {
		opacity: 0.85;
	}
	.resend-button:disabled {
		background: var(--border);
		border-color: var(--border);
		color: var(--muted);
		cursor: not-allowed;
	}

	.message {
		margin-top: 0.75rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
	}
	.message--error {
		color: var(--accent);
	}
	.message--success {
		color: #3a6b3a;
	}

	.secondary-link {
		display: block;
		margin-top: 1.5rem;
		color: var(--muted);
		text-decoration: none;
		font-size: 0.78rem;
		letter-spacing: 0.02em;
		border-top: 1px solid var(--border);
		padding-top: 1.25rem;
		transition: color 0.2s ease;
	}
	.secondary-link:hover {
		color: var(--fg);
	}
</style> -->


<!-- src/routes/auth/verify-email/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import MailIcon from "@lucide/svelte/icons/mail";
	import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";

	let {
		data,
		form
	}: {
		data: { email: string | null };
		form?: { error?: string; success?: boolean; stillUnverified?: boolean };
	} = $props();

	let loading = $state(false);
	let checking = $state(false);
	let cooldown = $state(0);
	let cooldownInterval: ReturnType<typeof setInterval> | null = null;

	function startCooldown(seconds = 60) {
		cooldown = seconds;
		cooldownInterval = setInterval(() => {
			cooldown -= 1;
			if (cooldown <= 0 && cooldownInterval) {
				clearInterval(cooldownInterval);
				cooldownInterval = null;
			}
		}, 1000);
	}
</script>

<svelte:head>
	<title>Vérifie ton email</title>
</svelte:head>

<div class="archive">
	<div class="masthead">
		<span class="masthead__eyebrow">Vérification</span>
	</div>

	<div class="archive__inner">
		<div class="card">
			<span class="card__icon">
				<MailIcon size={16} strokeWidth={1.75} />
			</span>

			<h1 class="title">Vérifie ta boîte mail</h1>
			<p class="body">
				{#if data.email}
					Un lien de vérification a été envoyé à <strong>{data.email}</strong>. Clique dessus
					pour activer ton compte.
				{:else}
					Un lien de vérification a été envoyé à ton adresse email. Clique dessus pour activer
					ton compte.
				{/if}
			</p>

			<form
				method="POST"
				action="?/recheck"
				use:enhance={() => {
					checking = true;
					return async ({ update }) => {
						checking = false;
						await update();
					};
				}}
			>
				<button type="submit" class="recheck-button" disabled={checking}>
					<RefreshCwIcon size={14} strokeWidth={2} class={checking ? 'spin' : ''} />
					{checking ? 'Vérification…' : "J'ai vérifié mon email"}
				</button>
			</form>

			<form
				method="POST"
				action="?/resend"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							startCooldown();
						}
						await update();
					};
				}}
			>
				<button type="submit" class="resend-button" disabled={loading || cooldown > 0}>
					{#if loading}
						Envoi…
					{:else if cooldown > 0}
						Renvoyer ({cooldown}s)
					{:else}
						Renvoyer l'email
					{/if}
				</button>
			</form>

			{#if form?.error}
				<p class="message message--error">{form.error}</p>
			{:else if form?.stillUnverified}
				<p class="message message--pending">Toujours pas vérifié — clique sur le lien reçu par email, puis réessaie.</p>
			{:else if form?.success}
				<p class="message message--success">Email renvoyé.</p>
			{/if}

			<a href="/auth/login" class="secondary-link">Retour à la connexion</a>
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@400;500;600&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;
		--success: #3a6b3a;

		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
	}

	.masthead {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.masthead__eyebrow {
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.archive__inner {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.card {
		width: 100%;
		max-width: 400px;
		padding: 2.25rem 1.75rem;
		border: 1px solid var(--border);
		text-align: center;
	}

	.card__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		margin-bottom: 1.25rem;
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1.5rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.body {
		margin-top: 0.6rem;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.recheck-button,
	.resend-button {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.75rem 1rem;
		margin-top: 1rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.recheck-button {
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
	}

	.resend-button {
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--border);
	}

	.recheck-button:hover:not(:disabled),
	.resend-button:hover:not(:disabled) {
		opacity: 0.85;
	}

	.recheck-button:disabled,
	.resend-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	:global(.spin) {
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.message {
		margin-top: 1rem;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	.message--error { color: var(--accent); }
	.message--success { color: var(--success); }
	.message--pending { color: var(--muted); }

	.secondary-link {
		display: inline-block;
		margin-top: 1.5rem;
		font-size: 0.78rem;
		color: var(--muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>