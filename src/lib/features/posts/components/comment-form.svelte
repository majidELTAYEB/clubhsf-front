<!-- src/lib/features/posts/components/comment-form.svelte -->
<script lang="ts">
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import { createComment } from '$lib/features/posts/api';
	import type { Comment } from '$lib/features/posts/types';

	let {
		postId,
		parentId,
		placeholder = 'Écris un commentaire...',
		autofocus = false,
		onSubmitted,
		onCancel
	}: {
		postId: string;
		parentId?: string;
		placeholder?: string;
		autofocus?: boolean;
		onSubmitted: (comment: Comment) => void;
		onCancel?: () => void;
	} = $props();

	let content = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);
	let textareaRef: HTMLTextAreaElement | undefined = $state();

	$effect(() => {
		if (autofocus) textareaRef?.focus();
	});

	async function submit() {
		if (!content.trim()) return;
		if (/[<>]/.test(content)) {
			errorMsg = 'Le commentaire ne peut pas contenir < ou >.';
			return;
		}

		submitting = true;
		errorMsg = null;
		try {
			const comment = await createComment(postId, { content: content.trim(), parent_id: parentId });
			content = '';
			onSubmitted(comment);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : "Échec de l'envoi";
		} finally {
			submitting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			submit();
		}
	}
</script>

<div class="comment-form">
	<textarea
		bind:this={textareaRef}
		bind:value={content}
		{placeholder}
		rows="2"
		maxlength="5000"
		onkeydown={handleKeydown}
	></textarea>

	{#if errorMsg}
		<p class="comment-form__error">{errorMsg}</p>
	{/if}

	<div class="comment-form__actions">
		{#if onCancel}
			<button type="button" class="comment-form__cancel" onclick={onCancel}>Annuler</button>
		{/if}
		<button type="button" class="comment-form__submit" onclick={submit} disabled={submitting || !content.trim()}>
			{#if submitting}
				<LoaderIcon size={12} strokeWidth={2} class="spin" />
			{/if}
			{submitting ? 'Envoi…' : 'Envoyer'}
		</button>
	</div>
</div>

<style>
	.comment-form {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		font-family: 'Inter', sans-serif;
	}

	.comment-form textarea {
		width: 100%;
		box-sizing: border-box;
		padding: 0.55rem 0.7rem;
		border: 1px solid var(--border);
		background: var(--bg);
		font-family: 'Inter', sans-serif;
		font-size: 16px;
		color: var(--fg);
		resize: vertical;
	}
	.comment-form textarea:focus { outline: none; border-color: var(--fg); }

	.comment-form__error {
		margin: 0.4rem 0 0;
		font-size: 0.72rem;
		color: var(--fg);
	}

	.comment-form__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.comment-form__submit,
	.comment-form__cancel {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.85rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.72rem;
		font-weight: 500;
		cursor: pointer;
	}
	.comment-form__submit {
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
	}
	.comment-form__submit:disabled { opacity: 0.5; cursor: not-allowed; }
	.comment-form__cancel {
		background: none;
		color: var(--muted);
		border: 1px solid var(--border);
	}
	.comment-form__cancel:hover { border-color: var(--fg); color: var(--fg); }

	:global(.spin) {
		animation: comment-form-spin 0.8s linear infinite;
	}
	@keyframes comment-form-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.spin) { animation: none; }
	}
</style>
