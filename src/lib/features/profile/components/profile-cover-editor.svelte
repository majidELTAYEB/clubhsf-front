<!-- src/lib/features/profile/components/profile-cover-editor.svelte -->
<script lang="ts">
	import CameraIcon from "@lucide/svelte/icons/camera";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import CheckIcon from "@lucide/svelte/icons/check";
	import { presignImageUpload, updateProfile } from '$lib/features/profile/api';

	let {
		avatarUrl,
		coverUrl,
		onUpdated
	}: {
		avatarUrl: string | null | undefined;
		coverUrl: string | null | undefined;
		onUpdated: () => void | Promise<void>;
	} = $props();

	let avatarFile = $state<File | null>(null);
	let coverFile = $state<File | null>(null);
	let avatarPreview = $state<string | null>(null);
	let coverPreview = $state<string | null>(null);
	let uploading = $state<'avatar' | 'cover' | null>(null);
	let justSaved = $state<'avatar' | 'cover' | null>(null);
	let errorMsg = $state<string | null>(null);

	let avatarInput: HTMLInputElement | undefined = $state();
	let coverInput: HTMLInputElement | undefined = $state();

	let displayedAvatar = $derived(avatarPreview ?? avatarUrl);
	let displayedCover = $derived(coverPreview ?? coverUrl);

	function pickFile(kind: 'avatar' | 'cover') {
		(kind === 'avatar' ? avatarInput : coverInput)?.click();
	}

	function handleFileSelected(kind: 'avatar' | 'cover', e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0] ?? null;
		if (!file) return;

		const previewUrl = URL.createObjectURL(file);
		if (kind === 'avatar') {
			avatarFile = file;
			avatarPreview = previewUrl;
		} else {
			coverFile = file;
			coverPreview = previewUrl;
		}
	}

	function cancelChange(kind: 'avatar' | 'cover') {
		if (kind === 'avatar') {
			avatarFile = null;
			avatarPreview = null;
		} else {
			coverFile = null;
			coverPreview = null;
		}
	}

	async function saveImage(kind: 'avatar' | 'cover') {
		const file = kind === 'avatar' ? avatarFile : coverFile;
		if (!file) return;

		uploading = kind;
		errorMsg = null;

		try {
			const presign = await presignImageUpload(kind, file.name, file.type);

			const putRes = await fetch(presign.upload_url, {
				method: 'PUT',
				headers: { 'Content-Type': file.type },
				body: file
			});
			if (!putRes.ok) throw new Error(`Upload échoué : ${putRes.status}`);

			const field = kind === 'avatar' ? 'avatar_url' : 'cover_image_url';
			await updateProfile({ [field]: presign.public_url });

			cancelChange(kind);
			await onUpdated();
			// La modale reste ouverte — l'utilisateur peut enchaîner sur l'autre
			// photo juste en dessous sans avoir à rouvrir.
			justSaved = kind;
			setTimeout(() => {
				if (justSaved === kind) justSaved = null;
			}, 1600);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : "Échec de l'envoi";
		} finally {
			uploading = null;
		}
	}

	async function removeImage(kind: 'avatar' | 'cover') {
		uploading = kind;
		errorMsg = null;
		try {
			const field = kind === 'avatar' ? 'avatar_url' : 'cover_image_url';
			await updateProfile({ [field]: null });
			cancelChange(kind);
			await onUpdated();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Échec de la suppression';
		} finally {
			uploading = null;
		}
	}
</script>

<div class="field-group">
	<span class="eyebrow">Couverture</span>

	<button type="button" class="cover-preview" onclick={() => pickFile('cover')}>
		{#if displayedCover}
			<img src={displayedCover} alt="Couverture" />
		{/if}

		<!-- Badge toujours visible — indispensable sur mobile où il n'y a pas de hover -->
		<span class="camera-badge camera-badge--cover">
			<CameraIcon size={13} strokeWidth={1.75} />
			<span>{displayedCover ? 'Changer' : 'Ajouter'}</span>
		</span>

		<!-- Overlay complet au survol, bonus desktop -->
		<span class="preview-overlay">
			<CameraIcon size={16} strokeWidth={1.75} />
			<span>{displayedCover ? 'Changer' : 'Ajouter une couverture'}</span>
		</span>
	</button>
	<input
		bind:this={coverInput}
		type="file"
		accept="image/*"
		class="sr-only"
		onchange={(e) => handleFileSelected('cover', e)}
	/>

	{#if coverFile}
		<div class="pending-actions">
			<button type="button" class="btn-save" onclick={() => saveImage('cover')} disabled={uploading === 'cover'}>
				{#if uploading === 'cover'}<LoaderIcon size={13} strokeWidth={2} class="spin" />{/if}
				{uploading === 'cover' ? 'Envoi…' : 'Enregistrer'}
			</button>
			<button type="button" class="btn-cancel" onclick={() => cancelChange('cover')} disabled={uploading === 'cover'}>
				Annuler
			</button>
		</div>
	{:else if coverUrl}
		<div class="pending-actions">
			<button type="button" class="btn-remove" onclick={() => removeImage('cover')} disabled={uploading === 'cover'}>
				{#if uploading === 'cover'}<LoaderIcon size={13} strokeWidth={2} class="spin" />{/if}
				{uploading === 'cover' ? 'Suppression…' : 'Retirer la photo'}
			</button>
		</div>
	{/if}
	{#if justSaved === 'cover'}
		<p class="success-msg"><CheckIcon size={13} strokeWidth={2.5} /> Couverture enregistrée</p>
	{/if}
</div>

<div class="field-group">
	<span class="eyebrow">Avatar</span>

	<button type="button" class="avatar-preview" onclick={() => pickFile('avatar')}>
		{#if displayedAvatar}
			<img src={displayedAvatar} alt="Avatar" />
		{/if}

		<span class="camera-badge camera-badge--avatar">
			<CameraIcon size={12} strokeWidth={1.75} />
		</span>

		<span class="preview-overlay">
			<CameraIcon size={14} strokeWidth={1.75} />
		</span>
	</button>
	<input
		bind:this={avatarInput}
		type="file"
		accept="image/*"
		class="sr-only"
		onchange={(e) => handleFileSelected('avatar', e)}
	/>

	{#if avatarFile}
		<div class="pending-actions">
			<button type="button" class="btn-save" onclick={() => saveImage('avatar')} disabled={uploading === 'avatar'}>
				{#if uploading === 'avatar'}<LoaderIcon size={13} strokeWidth={2} class="spin" />{/if}
				{uploading === 'avatar' ? 'Envoi…' : 'Enregistrer'}
			</button>
			<button type="button" class="btn-cancel" onclick={() => cancelChange('avatar')} disabled={uploading === 'avatar'}>
				Annuler
			</button>
		</div>
	{:else if avatarUrl}
		<div class="pending-actions">
			<button type="button" class="btn-remove" onclick={() => removeImage('avatar')} disabled={uploading === 'avatar'}>
				{#if uploading === 'avatar'}<LoaderIcon size={13} strokeWidth={2} class="spin" />{/if}
				{uploading === 'avatar' ? 'Suppression…' : 'Retirer la photo'}
			</button>
		</div>
	{/if}
	{#if justSaved === 'avatar'}
		<p class="success-msg"><CheckIcon size={13} strokeWidth={2.5} /> Avatar enregistré</p>
	{/if}

	{#if errorMsg}
		<p class="error-msg">{errorMsg}</p>
	{/if}
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
	.field-group:last-of-type { border-bottom: none; margin-bottom: 0; }

	.eyebrow {
		display: block;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.9rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	/* Badge caméra toujours visible, distinct de l'overlay au survol */
	.camera-badge {
		position: absolute;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: rgba(18, 18, 16, 0.72);
		color: #fff;
		font-size: 0.65rem;
		font-weight: 500;
		z-index: 1;
	}
	.camera-badge--cover {
		bottom: 0.6rem;
		right: 0.6rem;
		padding: 0.35rem 0.6rem;
	}
	.camera-badge--avatar {
		bottom: 0.2rem;
		right: 0.2rem;
		width: 1.4rem;
		height: 1.4rem;
		justify-content: center;
		border: 1.5px solid #fff;
	}

	/* Couverture — grand rectangle cliquable */
	.cover-preview {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 16 / 6;
		background: #f1efe9;
		border: 1px solid var(--border);
		padding: 0;
		cursor: pointer;
		overflow: hidden;
	}
	.cover-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.cover-preview .preview-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: rgba(18, 18, 16, 0.35);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 500;
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	.cover-preview:hover .preview-overlay { opacity: 1; }

	/* Avatar — petit carré cliquable */
	.avatar-preview {
		position: relative;
		display: block;
		width: 4.5rem;
		height: 4.5rem;
		background: #f1efe9;
		border: 1px solid var(--border);
		padding: 0;
		cursor: pointer;
		overflow: hidden;
	}
	.avatar-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.avatar-preview .preview-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(18, 18, 16, 0.35);
		color: #fff;
		opacity: 0;
		transition: opacity 0.2s ease;
	}
	.avatar-preview:hover .preview-overlay { opacity: 1; }

	.pending-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	.btn-save,
	.btn-cancel,
	.btn-remove {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 0.9rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.72rem;
		font-weight: 500;
		cursor: pointer;
	}
	.btn-save {
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
	}
	.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-cancel {
		background: none;
		color: var(--muted);
		border: 1px solid var(--border);
	}
	.btn-cancel:hover { border-color: var(--fg); color: var(--fg); }

	.btn-remove {
		background: none;
		color: var(--muted);
		border: 1px solid var(--border);
	}
	.btn-remove:hover { border-color: var(--fg); color: var(--fg); }
	.btn-remove:disabled { opacity: 0.5; cursor: not-allowed; }

	.error-msg {
		margin-top: 0.6rem;
		font-size: 0.75rem;
		color: var(--accent);
	}

	.success-msg {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.6rem;
		font-size: 0.75rem;
		color: var(--fg);
		font-weight: 500;
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
</style>