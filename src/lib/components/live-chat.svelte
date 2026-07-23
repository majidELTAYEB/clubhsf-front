<!-- src/lib/components/live-chat.svelte -->
<script lang="ts">
	import SendIcon from '@lucide/svelte/icons/send';

	type Message = {
		id: string;
		viewerId: string;
		content: string;
		avatarUrl?: string;
	};

	let {
		messages,
		onSend,
		disabled = false,
		placeholder = 'Écrire un message…',
		viewerCount
	}: {
		messages: Message[];
		onSend?: (content: string) => void;
		disabled?: boolean;
		placeholder?: string;
		viewerCount?: number;
	} = $props();

	let draft = $state('');
	let scrollContainer: HTMLDivElement;

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!draft.trim() || !onSend) return;
		onSend(draft.trim());
		draft = '';
	}

	$effect(() => {
		messages.length;
		scrollContainer?.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
	});
</script>

<div class="chat">
	<div class="chat__head">
		<span class="chat__title">Chat en direct</span>
		{#if viewerCount !== undefined}
			<span class="chat__viewers">
				<span class="pulse"><span class="pulse__ring"></span><span class="pulse__dot"></span></span>
				{viewerCount} spectateur{viewerCount > 1 ? 's' : ''}
			</span>
		{/if}
	</div>

	<div bind:this={scrollContainer} class="chat__messages">
		{#each messages as msg (msg.id)}
			<div class="message">
				<div class="message__avatar">
					{#if msg.avatarUrl}
						<img src={msg.avatarUrl} alt={msg.viewerId} />
					{:else}
						<span>{msg.viewerId?.[0]?.toUpperCase()}</span>
					{/if}
				</div>
				<p class="message__body">
					<span class="message__author">{msg.viewerId}</span>
					<span class="message__content">{msg.content}</span>
				</p>
			</div>
		{:else}
			<div class="chat__empty">
				<p>Aucun message pour le moment.</p>
			</div>
		{/each}
	</div>

	{#if onSend}
		<form onsubmit={handleSubmit} class="chat__form">
			<input
				bind:value={draft}
				{placeholder}
				{disabled}
				class="chat__input"
				type="text"
			/>
			<button type="submit" class="chat__send" disabled={disabled || !draft.trim()} aria-label="Envoyer">
				<SendIcon size={15} strokeWidth={1.75} />
			</button>
		</form>
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.chat {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: column;
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
	}

	.chat__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	.chat__title {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.chat__viewers {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		color: var(--muted);
	}

	.pulse {
		position: relative;
		display: inline-flex;
		width: 0.4rem;
		height: 0.4rem;
	}
	.pulse__ring {
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		background: var(--accent);
		opacity: 0.6;
		animation: pulse-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	.pulse__dot {
		position: relative;
		display: block;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: var(--accent);
	}
	@keyframes pulse-ping {
		75%, 100% { transform: scale(2.2); opacity: 0; }
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse__ring { animation: none; }
	}

	/* Messages */
	.chat__messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.message {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
	}

	.message__avatar {
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		background: #f8f7f3;
		overflow: hidden;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		font-weight: 500;
		color: var(--muted);
	}
	.message__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.message__body {
		min-width: 0;
		font-size: 0.85rem;
		line-height: 1.5;
	}
	.message__author {
		font-weight: 600;
	}
	.message__content {
		margin-left: 0.3rem;
		color: #3a382f;
	}

	.chat__empty {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
	.chat__empty p {
		font-size: 0.82rem;
		color: var(--muted);
	}

	/* Form */
	.chat__form {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem;
		border-top: 1px solid var(--border);
	}

	.chat__input {
		flex: 1;
		min-width: 0;
		padding: 0.55rem 0.75rem;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
	}
	.chat__input:focus {
		outline: none;
		border-color: var(--fg);
	}
	.chat__input:disabled {
		background: #f8f7f3;
		color: var(--muted);
	}

	.chat__send {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.3rem;
		height: 2.3rem;
		border: 1px solid var(--fg);
		background: var(--fg);
		color: #fff;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}
	.chat__send:hover:not(:disabled) {
		opacity: 0.8;
	}
	.chat__send:disabled {
		border-color: var(--border);
		background: var(--border);
		color: var(--muted);
		cursor: not-allowed;
	}
</style>