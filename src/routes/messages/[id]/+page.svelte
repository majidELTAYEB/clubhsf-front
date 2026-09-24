<script lang="ts">
	import { page } from '$app/state';
	import ConversationThread from '$lib/features/messaging/components/ConversationThread.svelte';

	let conversationId = $derived(page.params.id);
	let currentUserId = $derived(page.data.profile?.id ?? '');

</script>

<div class="thread-page">
	<ConversationThread {conversationId} {currentUserId} />
</div>

<style>
	.thread-page {
		height: 100dvh;
	}
</style>