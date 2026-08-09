<!-- src/lib/features/posts/components/post-form.svelte -->
<script lang="ts">
	import CameraIcon from "@lucide/svelte/icons/camera";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import { createPost, updatePost, presignPostImage } from '$lib/features/posts/api';
	import type { Post } from '$lib/features/posts/types';

	let {
		post = null,
		onSaved
	}: {
		post?: Post | null;
		onSaved: (post: Post) => void;
	} = $props();

	const isEditing = post !== null;

	let title = $state(post?.title ?? '');
	let content = $state(post?.content ?? '');
	let coverFile = $state<File | null>(null);
	let coverPreview = $state<string | null>(null);
	let existingCoverUrl = $state(post?.cover_image_url ?? null);
	let coverInput: HTMLInputElement | undefined = $state();

	let saving = $state(false);
	let uploadingImage = $state(false);
	let errorMsg = $state<string | null>(null);

	let displayedCover = $derived(coverPreview ?? existingCoverUrl);

	function pickFile() {
		coverInput?.click();
	}

	function handleFileSelected(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0] ?? null;
		if (!file) return;
		coverFile = file;
		coverPreview = URL.createObjectURL(file);
	}

	function removeCover() {
		coverFile = null;
		coverPreview = null;
		existingCoverUrl = null;
	}

	async function submit() {
		if (!title.trim() || !content.trim()) {
			errorMsg = 'Le titre et le contenu sont obligatoires.';
			return;
		}
		if (/[<>]/.test(title) || /[<>]/.test(content)) {
			errorMsg = "Le titre et le contenu ne peuvent pas contenir < ou >.";
			return;
		}

		errorMsg = null;
		saving = true;

		try {
			let coverImageUrl: string | null | undefined = existingCoverUrl;

			// Upload de la nouvelle image d'abord, si l'utilisateur en a choisi une.
			if (coverFile) {
				uploadingImage = true;
				const presign = await presignPostImage(coverFile.name, coverFile.type);

				const putRes = await fetch(presign.upload_url, {
					method: 'PUT',
					headers: { 'Content-Type': coverFile.type },
					body: coverFile
				});
				if (!putRes.ok) {
					throw new Error("L'image n'a pas pu être envoyée. Réessaie.");
				}
				coverImageUrl = presign.public_url;
				uploadingImage = false;
			}

			const payload = {
				title: title.trim(),
				content: content.trim(),
				cover_image_url: coverImageUrl
			};

			const saved = isEditing && post ? await updatePost(post.id, payload) : await createPost(payload);
			onSaved(saved);
		} catch (err) {
			// Le backend ne renvoie que le message texte au front actuellement,
			// pas le code d'erreur (POST_RATE_LIMITED, etc.) — donc on affiche
			// le message tel quel plutôt que de personnaliser par cas.
			errorMsg = err instanceof Error ? err.message : "Échec de l'enregistrement";
		} finally {
			saving = false;
			uploadingImage = false;
		}
	}
</script>

<div class="post-form">
	<label class="field">
		<span>Titre</span>
		<input type="text" bind:value={title} maxlength="200" placeholder="Le titre de ton post" />
	</label>

	<label class="field">
		<span>Contenu</span>
		<textarea bind:value={content} rows="6" maxlength="20000" placeholder="Écris quelque chose..."></textarea>
	</label>

	<div class="field">
		<span>Image de couverture (optionnel)</span>
		{#if displayedCover}
			<div class="cover-preview">
				<img src={displayedCover} alt="Aperçu" />
				<button type="button" class="cover-remove" onclick={removeCover} aria-label="Retirer l'image">
					Retirer
				</button>
			</div>
		{:else}
			<button type="button" class="cover-picker" onclick={pickFile}>
				<CameraIcon size={16} strokeWidth={1.75} />
				<span>Ajouter une image</span>
			</button>
		{/if}
		<input
			bind:this={coverInput}
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif"
			class="sr-only"
			onchange={handleFileSelected}
		/>
	</div>

	{#if errorMsg}
		<p class="error-msg">{errorMsg}</p>
	{/if}

	<button type="button" class="submit-button" onclick={submit} disabled={saving}>
		{#if saving}
			<LoaderIcon size={13} strokeWidth={2} class="spin" />
			{uploadingImage ? "Envoi de l'image…" : 'Publication…'}
		{:else}
			{isEditing ? 'Enregistrer les modifications' : 'Publier'}
		{/if}
	</button>
</div>

<style>
	.post-form {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		font-family: 'Inter', sans-serif;
	}

	.field {
		display: block;
		margin-bottom: 1.1rem;
		font-size: 0.78rem;
		color: var(--muted);
	}
	.field span { display: block; margin-bottom: 0.35rem; }
	.field input,
	.field textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		background: var(--bg);
		font-family: 'Inter', sans-serif;
		font-size: 16px;
		color: var(--fg);
		resize: vertical;
	}
	.field input:focus,
	.field textarea:focus { outline: none; border-color: var(--fg); }

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	.cover-picker {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		aspect-ratio: 16 / 7;
		background: #f8f7f3;
		border: 1px dashed var(--border);
		color: var(--muted);
		font-size: 0.8rem;
		cursor: pointer;
		transition: border-color 0.2s ease, color 0.2s ease;
	}
	.cover-picker:hover { border-color: var(--fg); color: var(--fg); }

	.cover-preview {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 7;
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.cover-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.cover-remove {
		position: absolute;
		bottom: 0.6rem;
		right: 0.6rem;
		padding: 0.35rem 0.7rem;
		background: rgba(18, 18, 16, 0.72);
		color: #fff;
		border: none;
		font-size: 0.68rem;
		font-weight: 500;
		cursor: pointer;
	}

	.error-msg {
		margin: 0 0 1rem;
		padding: 0.6rem 0.8rem;
		background: #f8f7f3;
		border-left: 2px solid var(--fg);
		font-size: 0.78rem;
		color: var(--fg);
	}

	.submit-button {
		width: 100%;
		padding: 0.7rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
	}
	.submit-button:disabled { opacity: 0.5; cursor: not-allowed; }

	:global(.spin) {
		animation: post-form-spin 0.8s linear infinite;
	}
	@keyframes post-form-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.spin) { animation: none; }
	}
</style>
