<!-- src/lib/components/live-chat.svelte -->
<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import SendIcon from '@lucide/svelte/icons/send';

	type Message = {
		id: string;
		username: string;
		content: string;
		avatarUrl?: string;
	};

	let {
		messages,
		onSend,
		disabled = false,
		placeholder = 'Écrire un message...'
	}: {
		messages: Message[];
		onSend?: (content: string) => void;
		disabled?: boolean;
		placeholder?: string;
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

<div class="flex h-[80%] w-full flex-col rounded-xl border">
	<div class="flex items-center justify-between border-b px-4 py-3">
		<p class="text-sm font-medium">Chat en direct</p>
	</div>

	<div bind:this={scrollContainer} class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
		{#each messages as msg (msg.id)}
			<div class="flex items-start gap-2">
				<Avatar class="size-6">
					<AvatarImage src={msg.avatarUrl} alt={msg.username} />
					<AvatarFallback class="text-xs">{msg.username[0]}</AvatarFallback>
				</Avatar>
				<div class="text-sm">
					<span class="font-medium">{msg.username}</span>
					<span class="text-muted-foreground ml-1">{msg.content}</span>
				</div>
			</div>
		{:else}
			<p class="text-muted-foreground text-sm">Aucun message pour le moment.</p>
		{/each}
	</div>

	{#if onSend}
		<form onsubmit={handleSubmit} class="flex items-center gap-2 border-t p-3">
			<Input bind:value={draft} {placeholder} {disabled} class="flex-1" />
			<Button type="submit" size="icon" disabled={disabled || !draft.trim()}>
				<SendIcon class="size-4" />
			</Button>
		</form>
	{/if}
</div>