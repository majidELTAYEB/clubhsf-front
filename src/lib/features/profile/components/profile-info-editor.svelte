<!-- src/lib/features/profile/components/profile-info-editor.svelte
<script lang="ts">
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import CheckIcon from "@lucide/svelte/icons/check";
	import { updateProfile, addSocialLink as addSocialLinkApi, removeSocialLink as removeSocialLinkApi } from '$lib/features/profile/api';
	import type { SocialLink } from '$lib/features/profile/types';

	let {
		bio: initialBio,
		location: initialLocation,
		websiteUrl: initialWebsiteUrl,
		socialLinks,
		onUpdated
	}: {
		bio: string;
		location: string;
		websiteUrl: string;
		socialLinks: SocialLink[];
		onUpdated: () => void | Promise<void>;
	} = $props();

	let bio = $state(initialBio);
	let location = $state(initialLocation);
	let websiteUrl = $state(initialWebsiteUrl);
	let saving = $state(false);
	let justSaved = $state(false);
	let errorMsg = $state<string | null>(null);

	let socialPlatform = $state('instagram');
	let socialUrl = $state('');

	async function saveInfo() {
		saving = true;
		errorMsg = null;
		try {
			await updateProfile({
				bio: bio || null,
				location: location || null,
				website_url: websiteUrl || null
			});
			await onUpdated();
			// Confirmation éphémère — la modale reste ouverte, l'utilisateur peut
			// enchaîner sur les réseaux sociaux juste en dessous sans réouvrir.
			justSaved = true;
			setTimeout(() => (justSaved = false), 1600);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Échec de la sauvegarde';
		} finally {
			saving = false;
		}
	}

	let addingSocial = $state(false);
	let removingPlatform = $state<string | null>(null);

	async function addSocialLink() {
		if (!socialUrl) return;
		addingSocial = true;
		errorMsg = null;
		try {
			await addSocialLinkApi(socialPlatform, socialUrl);
			socialUrl = '';
			await onUpdated();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : "Échec de l'ajout";
		} finally {
			addingSocial = false;
		}
	}

	async function removeSocialLink(platform: string) {
		removingPlatform = platform;
		errorMsg = null;
		try {
			await removeSocialLinkApi(platform);
			await onUpdated();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Échec de la suppression';
		} finally {
			removingPlatform = null;
		}
	}
</script>

<div class="field-group">
	<span class="eyebrow">Informations</span>

	<label class="field">
		<span>Bio</span>
		<textarea bind:value={bio} rows="3"></textarea>
	</label>
	<label class="field">
		<span>Localisation</span>
		<input type="text" bind:value={location} />
	</label>
	<label class="field">
		<span>Site web</span>
		<input type="text" bind:value={websiteUrl} placeholder="https://..." />
	</label>

	{#if errorMsg}
		<p class="error-msg">{errorMsg}</p>
	{/if}

	<button type="button" class="save-button" class:save-button--success={justSaved} onclick={saveInfo} disabled={saving}>
		{#if saving}
			<LoaderIcon size={13} strokeWidth={2} class="spin" />
			Enregistrement…
		{:else if justSaved}
			<CheckIcon size={13} strokeWidth={2.5} />
			Enregistré
		{:else}
			Enregistrer
		{/if}
	</button>
</div>

<div class="field-group">
	<span class="eyebrow">Réseaux sociaux</span>

	{#if socialLinks.length > 0}
		<ul class="social-list">
			{#each socialLinks as link (link.platform)}
				<li>
					<span>{link.platform}</span>
					<button
						type="button"
						onclick={() => removeSocialLink(link.platform)}
						disabled={removingPlatform === link.platform}
						aria-label="Supprimer"
					>
						{#if removingPlatform === link.platform}
							<LoaderIcon size={13} strokeWidth={1.75} class="spin" />
						{:else}
							<TrashIcon size={13} strokeWidth={1.75} />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="social-add">
		<select bind:value={socialPlatform}>
			<option value="instagram">Instagram</option>
			<option value="linkedin">LinkedIn</option>
			<option value="twitter">Twitter</option>
			<option value="youtube">YouTube</option>
			<option value="tiktok">TikTok</option>
			<option value="facebook">Facebook</option>
			<option value="website">Website</option>
		</select>
		<input type="text" placeholder="https://..." bind:value={socialUrl} />
		<button type="button" onclick={addSocialLink} disabled={addingSocial || !socialUrl} aria-label="Ajouter">
			{#if addingSocial}
				<LoaderIcon size={13} strokeWidth={1.75} class="spin" />
			{:else}
				<PlusIcon size={13} strokeWidth={1.75} />
			{/if}
		</button>
	</div>
</div>

<style>
	.field-group {
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		padding-bottom: 1.75rem;
		margin-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
	}

	.eyebrow {
		display: block;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.9rem;
	}

	.field {
		display: block;
		margin-bottom: 0.9rem;
		font-size: 0.78rem;
		color: var(--muted);
	}
	.field span { display: block; margin-bottom: 0.3rem; }
	.field input, .field textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.55rem 0.7rem;
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
		font-size: 16px; /* évite le zoom auto d'iOS Safari sur les champs < 16px */
		color: var(--fg);
	}
	.field input:focus, .field textarea:focus { outline: none; border-color: var(--fg); }

	.error-msg {
		margin: 0.5rem 0 0;
		font-size: 0.75rem;
		color: var(--accent);
	}

	.save-button {
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.65rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
	}
	.save-button:disabled { opacity: 0.5; cursor: not-allowed; }
	.save-button--success {
		background: var(--fg);
		opacity: 1;
	}

	:global(.spin) {
		animation: profile-spin 0.8s linear infinite;
	}
	@keyframes profile-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.spin) { animation: none; }
	}

	.social-list {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
	}
	.social-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.8rem;
		text-transform: capitalize;
	}
	.social-list button {
		background: none;
		border: none;
		color: var(--accent);
		cursor: pointer;
	}

	.social-add {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.social-add select {
		border: 1px solid var(--border);
		padding: 0.5rem;
		font-size: 16px; /* évite le zoom auto d'iOS Safari */
		flex: 1 1 auto;
		min-width: 6.5rem;
	}
	.social-add input {
		flex: 3 1 8rem;
		border: 1px solid var(--border);
		padding: 0.5rem;
		font-size: 16px; /* évite le zoom auto d'iOS Safari */
		min-width: 0;
	}
	.social-add button {
		padding: 0.5rem 0.7rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		cursor: pointer;
		flex-shrink: 0;
	}
</style> -->

<!-- src/lib/features/profile/components/profile-info-editor.svelte -->
<script lang="ts">
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import CheckIcon from "@lucide/svelte/icons/check";
	import { updateProfile, addSocialLink as addSocialLinkApi, removeSocialLink as removeSocialLinkApi } from '$lib/features/profile/api';
	import type { SocialLink } from '$lib/features/profile/types';

	let {
		username: initialUsername,
		bio: initialBio,
		location: initialLocation,
		websiteUrl: initialWebsiteUrl,
		socialLinks,
		onUpdated
	}: {
		username: string;
		bio: string;
		location: string;
		websiteUrl: string;
		socialLinks: SocialLink[];
		onUpdated: () => void | Promise<void>;
	} = $props();

	let username = $state(initialUsername);
	let bio = $state(initialBio);
	let location = $state(initialLocation);
	let websiteUrl = $state(initialWebsiteUrl);
	let saving = $state(false);
	let justSaved = $state(false);
	let errorMsg = $state<string | null>(null);

	let socialPlatform = $state('instagram');
	let socialUrl = $state('');

	async function saveInfo() {
		saving = true;
		errorMsg = null;
		try {
			await updateProfile({
				username: username || undefined,
				bio: bio || null,
				location: location || null,
				website_url: websiteUrl || null
			});
			await onUpdated();
			// Confirmation éphémère — la modale reste ouverte, l'utilisateur peut
			// enchaîner sur les réseaux sociaux juste en dessous sans réouvrir.
			justSaved = true;
			setTimeout(() => (justSaved = false), 1600);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Échec de la sauvegarde';
		} finally {
			saving = false;
		}
	}

	let addingSocial = $state(false);
	let removingPlatform = $state<string | null>(null);

	async function addSocialLink() {
		if (!socialUrl) return;
		addingSocial = true;
		errorMsg = null;
		try {
			await addSocialLinkApi(socialPlatform, socialUrl);
			socialUrl = '';
			await onUpdated();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : "Échec de l'ajout";
		} finally {
			addingSocial = false;
		}
	}

	async function removeSocialLink(platform: string) {
		removingPlatform = platform;
		errorMsg = null;
		try {
			await removeSocialLinkApi(platform);
			await onUpdated();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Échec de la suppression';
		} finally {
			removingPlatform = null;
		}
	}
</script>

<div class="field-group">
	<span class="eyebrow">Informations</span>

	<label class="field">
		<span>Nom d'utilisateur</span>
		<input type="text" bind:value={username} />
	</label>
	<label class="field">
		<span>Bio</span>
		<textarea bind:value={bio} rows="3"></textarea>
	</label>
	<label class="field">
		<span>Localisation</span>
		<input type="text" bind:value={location} />
	</label>
	<label class="field">
		<span>Site web</span>
		<input type="text" bind:value={websiteUrl} placeholder="https://..." />
	</label>

	{#if errorMsg}
		<p class="error-msg">{errorMsg}</p>
	{/if}

	<button type="button" class="save-button" class:save-button--success={justSaved} onclick={saveInfo} disabled={saving}>
		{#if saving}
			<LoaderIcon size={13} strokeWidth={2} class="spin" />
			Enregistrement…
		{:else if justSaved}
			<CheckIcon size={13} strokeWidth={2.5} />
			Enregistré
		{:else}
			Enregistrer
		{/if}
	</button>
</div>

<div class="field-group">
	<span class="eyebrow">Réseaux sociaux</span>

	{#if socialLinks.length > 0}
		<ul class="social-list">
			{#each socialLinks as link (link.platform)}
				<li>
					<span>{link.platform}</span>
					<button
						type="button"
						onclick={() => removeSocialLink(link.platform)}
						disabled={removingPlatform === link.platform}
						aria-label="Supprimer"
					>
						{#if removingPlatform === link.platform}
							<LoaderIcon size={13} strokeWidth={1.75} class="spin" />
						{:else}
							<TrashIcon size={13} strokeWidth={1.75} />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="social-add">
		<select bind:value={socialPlatform}>
			<option value="instagram">Instagram</option>
			<option value="linkedin">LinkedIn</option>
			<option value="twitter">Twitter</option>
			<option value="youtube">YouTube</option>
			<option value="tiktok">TikTok</option>
			<option value="facebook">Facebook</option>
			<option value="website">Website</option>
		</select>
		<input type="text" placeholder="https://..." bind:value={socialUrl} />
		<button type="button" onclick={addSocialLink} disabled={addingSocial || !socialUrl} aria-label="Ajouter">
			{#if addingSocial}
				<LoaderIcon size={13} strokeWidth={1.75} class="spin" />
			{:else}
				<PlusIcon size={13} strokeWidth={1.75} />
			{/if}
		</button>
	</div>
</div>

<style>
	.field-group {
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		padding-bottom: 1.75rem;
		margin-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
	}

	.eyebrow {
		display: block;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.9rem;
	}

	.field {
		display: block;
		margin-bottom: 0.9rem;
		font-size: 0.78rem;
		color: var(--muted);
	}
	.field span { display: block; margin-bottom: 0.3rem; }
	.field input, .field textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.55rem 0.7rem;
		border: 1px solid var(--border);
		font-family: 'Inter', sans-serif;
		font-size: 16px; /* évite le zoom auto d'iOS Safari sur les champs < 16px */
		color: var(--fg);
	}
	.field input:focus, .field textarea:focus { outline: none; border-color: var(--fg); }

	.error-msg {
		margin: 0.5rem 0 0;
		font-size: 0.75rem;
		color: var(--accent);
	}

	.save-button {
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.65rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
	}
	.save-button:disabled { opacity: 0.5; cursor: not-allowed; }
	.save-button--success {
		background: var(--fg);
		opacity: 1;
	}

	:global(.spin) {
		animation: profile-spin 0.8s linear infinite;
	}
	@keyframes profile-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.spin) { animation: none; }
	}

	.social-list {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
	}
	.social-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.8rem;
		text-transform: capitalize;
	}
	.social-list button {
		background: none;
		border: none;
		color: var(--accent);
		cursor: pointer;
	}

	.social-add {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.social-add select {
		border: 1px solid var(--border);
		padding: 0.5rem;
		font-size: 16px; /* évite le zoom auto d'iOS Safari */
		flex: 1 1 auto;
		min-width: 6.5rem;
	}
	.social-add input {
		flex: 3 1 8rem;
		border: 1px solid var(--border);
		padding: 0.5rem;
		font-size: 16px; /* évite le zoom auto d'iOS Safari */
		min-width: 0;
	}
	.social-add button {
		padding: 0.5rem 0.7rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		cursor: pointer;
		flex-shrink: 0;
	}
</style>