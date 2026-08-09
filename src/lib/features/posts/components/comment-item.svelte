<!-- src/lib/features/posts/components/comment-item.svelte -->
<script lang="ts">
	import CommentForm from './comment-form.svelte';
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import { updateComment, deleteComment } from '$lib/features/posts/api';
	import type { Comment } from '$lib/features/posts/types';

	let {
		postId,
		comment,
		onDeleted
	}: {
		postId: string;
		comment: Comment;
		// Remonte jusqu'à la page — une suppression retire aussi tout le
		// sous-arbre en cascade côté backend, donc le front doit resynchroniser
		// plutôt que de patcher localement (comme indiqué dans la doc API).
		onDeleted: () => void;
	} = $props();

	let replies = $state<Comment[]>(comment.replies ?? []);
	let showReplyForm = $state(false);
	let showReplies = $state(comment.depth === 0);

	let editing = $state(false);
	let editContent = $state(comment.content);
	let savingEdit = $state(false);

	let deleting = $state(false);
	let showConfirmDelete = $state(false);
	let errorMsg = $state<string | null>(null);

	const MAX_DEPTH = 8;

	function handleReplyAdded(reply: import('$lib/features/posts/types').Comment) {
		replies = [...replies, reply];
		showReplyForm = false;
		showReplies = true;
	}

	async function saveEdit() {
		if (!editContent.trim()) return;
		savingEdit = true;
		errorMsg = null;
		try {
			const updated = await updateComment(postId, comment.id, editContent.trim());
			comment.content = updated.content;
			editing = false;
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : "Échec de l'édition";
		} finally {
			savingEdit = false;
		}
	}

	async function confirmDelete() {
		deleting = true;
		try {
			await deleteComment(postId, comment.id);
			onDeleted();
		} catch {
			deleting = false;
			showConfirmDelete = false;
		}
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
	}
</script>

<div class="comment" style={`--depth: ${Math.min(comment.depth, MAX_DEPTH)}`}>
	<div class="comment__body">
		<div class="comment__head">
			<div class="comment__avatar">
				{#if comment.author.avatar_url}
					<img src={comment.author.avatar_url} alt={comment.author.username} />
				{:else}
					<span>{comment.author.username.slice(0, 2).toUpperCase()}</span>
				{/if}
			</div>
			<span class="comment__username">{comment.author.username}</span>
			<span class="comment__date">{formatDate(comment.created_at)}</span>
		</div>

		{#if editing}
			<textarea class="comment__edit-area" bind:value={editContent} rows="2"></textarea>
			{#if errorMsg}<p class="comment__error">{errorMsg}</p>{/if}
			<div class="comment__edit-actions">
				<button type="button" onclick={saveEdit} disabled={savingEdit}>
					{#if savingEdit}<LoaderIcon size={11} strokeWidth={2} class="spin" />{/if}
					Enregistrer
				</button>
				<button type="button" onclick={() => (editing = false)} disabled={savingEdit}>Annuler</button>
			</div>
		{:else}
			<p class="comment__content">{comment.content}</p>
		{/if}

		<div class="comment__actions">
			{#if comment.depth < MAX_DEPTH}
				<button type="button" onclick={() => (showReplyForm = !showReplyForm)}>Répondre</button>
			{/if}
			{#if comment.can_edit && !editing}
				<button type="button" onclick={() => (editing = true)}>
					<PencilIcon size={11} strokeWidth={1.75} />
				</button>
				<button type="button" onclick={() => (showConfirmDelete = true)}>
					<Trash2Icon size={11} strokeWidth={1.75} />
				</button>
			{/if}
			{#if replies.length > 0}
				<button type="button" class="comment__toggle-replies" onclick={() => (showReplies = !showReplies)}>
					{showReplies ? 'Masquer' : 'Voir'} {replies.length} réponse{replies.length > 1 ? 's' : ''}
				</button>
			{/if}
		</div>

		{#if showConfirmDelete}
			<div class="comment__confirm">
				<span>Supprimer ce commentaire{replies.length > 0 ? ' et ses réponses' : ''} ?</span>
				<button type="button" onclick={confirmDelete} disabled={deleting}>
					{deleting ? '...' : 'Confirmer'}
				</button>
				<button type="button" onclick={() => (showConfirmDelete = false)} disabled={deleting}>Annuler</button>
			</div>
		{/if}

		{#if showReplyForm}
			<div class="comment__reply-form">
				<CommentForm
					{postId}
					parentId={comment.id}
					placeholder="Répondre à {comment.author.username}..."
					autofocus
					onSubmitted={handleReplyAdded}
					onCancel={() => (showReplyForm = false)}
				/>
			</div>
		{/if}
	</div>

	{#if showReplies && replies.length > 0}
		<div class="comment__replies">
			{#each replies as reply (reply.id)}
				<svelte:self {postId} comment={reply} onDeleted={() => (replies = replies.filter((r) => r.id !== reply.id))} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.comment {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;

		font-family: 'Inter', sans-serif;
	}

	.comment__body {
		padding: 0.9rem 0;
		border-top: 1px solid var(--border);
	}

	.comment__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.comment__avatar {
		width: 1.6rem;
		height: 1.6rem;
		flex-shrink: 0;
		border: 1px solid var(--border);
		background: #f1efe9;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.58rem;
		color: var(--muted);
	}
	.comment__avatar img { width: 100%; height: 100%; object-fit: cover; }

	.comment__username {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--fg);
	}
	.comment__date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		color: var(--muted);
	}

	.comment__content {
		font-size: 0.85rem;
		line-height: 1.55;
		color: #2b2a26;
		white-space: pre-line;
	}

	.comment__edit-area {
		width: 100%;
		box-sizing: border-box;
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--border);
		background: var(--bg);
		font-family: 'Inter', sans-serif;
		font-size: 16px;
		color: var(--fg);
		resize: vertical;
	}
	.comment__edit-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.4rem;
	}
	.comment__edit-actions button {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.65rem;
		font-size: 0.68rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--border);
		background: none;
		color: var(--fg);
	}
	.comment__edit-actions button:first-child {
		background: var(--fg);
		color: #fff;
		border-color: var(--fg);
	}

	.comment__error {
		margin: 0.3rem 0 0;
		font-size: 0.7rem;
		color: var(--fg);
	}

	.comment__actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.9rem;
		margin-top: 0.4rem;
	}
	.comment__actions button {
		display: inline-flex;
		align-items: center;
		background: none;
		border: none;
		padding: 0;
		color: var(--muted);
		font-size: 0.68rem;
		font-weight: 500;
		cursor: pointer;
	}
	.comment__actions button:hover { color: var(--fg); }
	.comment__toggle-replies {
		font-family: 'JetBrains Mono', monospace;
		text-transform: none;
	}

	.comment__confirm {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding: 0.5rem 0.7rem;
		background: #f8f7f3;
		border: 1px solid var(--border);
		font-size: 0.72rem;
	}
	.comment__confirm button {
		padding: 0.25rem 0.6rem;
		font-size: 0.66rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--border);
		background: none;
		color: var(--fg);
	}
	.comment__confirm button:first-of-type {
		background: var(--fg);
		color: #fff;
		border-color: var(--fg);
	}

	.comment__reply-form {
		margin-top: 0.6rem;
	}

	/* Indentation progressive — plafonnée pour ne pas exploser sur mobile
	   même à depth 8 (comme autorisé par le backend). */
	.comment__replies {
		margin-left: clamp(0.75rem, 3vw, 1.5rem);
		padding-left: 0.75rem;
		border-left: 1px solid var(--border);
	}

	:global(.spin) {
		animation: comment-item-spin 0.8s linear infinite;
	}
	@keyframes comment-item-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.spin) { animation: none; }
	}
</style>