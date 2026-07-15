<!-- src/lib/components/live-chat.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar/index.js';

	type Message = { id: string; username: string; content: string };

	let { messages, viewerCount }: { messages: Message[]; viewerCount?: number } = $props();
</script>

<Card.Root class="flex h-[420px] flex-col">
	<Card.Header class="flex-row items-center justify-between border-b py-3">
		<Card.Title class="text-sm">Chat en direct</Card.Title>
		{#if viewerCount !== undefined}
			<span class="text-muted-foreground text-xs">{viewerCount} spectateurs</span>
		{/if}
	</Card.Header>

	<ScrollArea class="flex-1 px-4">
		<div class="space-y-3 py-4">
			{#each messages as msg (msg.id)}
				<div class="flex items-start gap-2">
					<Avatar class="size-6">
						<AvatarFallback class="text-xs">{msg.username[0]}</AvatarFallback>
					</Avatar>
					<div class="text-sm">
						<span class="font-medium">{msg.username}</span>
						<span class="text-muted-foreground ml-1">{msg.content}</span>
					</div>
				</div>
			{/each}
		</div>
	</ScrollArea>

	<div class="text-muted-foreground border-t px-4 py-2.5 text-xs">
		Lecture seule — vue admin
	</div>
</Card.Root>