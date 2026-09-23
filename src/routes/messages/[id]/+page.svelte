<script lang="ts">
    import { page } from '$app/state';
    import ConversationThread from '$lib/features/messaging/components/ConversationThread.svelte';

    let conversationId = $derived(page.params.id);
    let currentUserId = $derived(/* $currentUser?.id ?? */ '');
    
    // Récupération directe et réactive du token envoyé par le serveur via page.data
    let accessToken = $derived(page.data.accessToken);
</script>

<div class="thread-page">
    <ConversationThread {conversationId} {currentUserId} {accessToken} />
</div>

<style>
    .thread-page {
        height: 100dvh;
    }
</style>