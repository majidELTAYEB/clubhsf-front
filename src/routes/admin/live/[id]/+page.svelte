<!-- <script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';

	import LivePlayer from '$lib/components/live-player.svelte';

	let { data }: { data: PageData } = $props();
	const live = data.live;

	let liveStream = $derived(live);
	let isLive = $derived(live.status === 'live');

	let copiedField = $state<string | null>(null);

	async function copy(value: string, field: string) {
		await navigator.clipboard.writeText(value);
		copiedField = field;
		setTimeout(() => (copiedField = null), 1500);
	}

</script>

{#snippet credentialField(label: string, value: string, field: string)}
	<div class="grid gap-1.5">
		<span class="text-muted-foreground text-sm">{label}</span>
		<div class="flex items-center gap-2">
			<code class="bg-muted flex-1 truncate rounded-md px-3 py-2 text-sm">{value}</code>
			<Button
				variant="outline"
				size="icon"
				class="shrink-0"
				onclick={() => copy(value, field)}
			>
				{#if copiedField === field}
					<CheckIcon class="size-4 text-green-600" />
				{:else}
					<CopyIcon class="size-4" />
				{/if}
			</Button>
		</div>
	</div>
{/snippet}

<div class="mx-auto w-5xl space-y-8 p-6">
	<div class="flex items-start justify-between gap-4">
		<div class="space-y-1.5">
			<h1 class="text-2xl font-semibold tracking-tight">{live.title}</h1>
			<div class="flex items-center gap-2">
				<Badge variant={isLive ? 'default' : 'secondary'} class="gap-1.5">
					{#if isLive}
						<span class="relative flex size-1.5">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"
							></span>
							<span class="relative inline-flex size-1.5 rounded-full bg-white"></span>
						</span>
					{/if}
					{live.status}
				</Badge>
				{#if live.schedule_at}
					<span class="text-muted-foreground text-sm">
						Programmé pour {new Date(live.schedule_at).toLocaleString()}
					</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="overflow-hidden rounded-xl border">
		<LivePlayer playbackId={liveStream.playback_id} title={live.title} />
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Configuration OBS</Card.Title>
			<Card.Description>Utilise ces informations pour démarrer ton stream.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-5">
			{@render credentialField('URL du serveur (RTMP)', live.rtmp_url, 'rtmp')}
			{@render credentialField('Clé de stream', live.stream_key, 'key')}
		</Card.Content>
	</Card.Root>
    <div class="mx-auto max-w-md p-6">
</div>
</div> -->

<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';
	import SquareIcon from '@lucide/svelte/icons/square';
	import UsersIcon from '@lucide/svelte/icons/users';

	import LivePlayer from '$lib/components/live-player.svelte';
	import LiveChat from '$lib/components/live-chat.svelte';

	import { getHistoryChat, getViewerCount } from '$lib/features/admin-live/api';

	let { data }: { data: PageData } = $props();
	const live = data.live;

	let liveStream = $derived(live);
	let isLive = $derived(live.status === 'live');

	let copiedField = $state<string | null>(null);
	let isEnding = $state(false);
	let endError = $state<string | null>(null);
	let showEndDialog = $state(false);

	async function copy(value: string, field: string) {
		await navigator.clipboard.writeText(value);
		copiedField = field;
		setTimeout(() => (copiedField = null), 1500);
	}

	async function endLive() {
		isEnding = true;
		endError = null;

		try {
			const res = await fetch(`/api/livestreams/${live.id}/end`, { method: 'PATCH' });
			if (!res.ok) throw new Error('Échec de la clôture du live');

			location.reload();
		} catch (err) {
			endError = err instanceof Error ? err.message : 'Une erreur est survenue';
		} finally {
			isEnding = false;
			showEndDialog = false;
		}
	}

	// Viewers : polling REST simple, aucun heartbeat envoyé depuis l'admin
	let viewerCount = $state<number | null>(null);
	let viewerInterval: ReturnType<typeof setInterval>;

	async function fetchViewerCount() {
		try {
			const data = await getViewerCount(live.id);	
			viewerCount = data.viewers ?? 0;
		} catch {
			// silencieux, on retente au prochain tick
		}
	}

	// Chat : historique une fois via REST, puis websocket en écoute seule
	function labelFor(viewerId: string) {
		return `Viewer-${viewerId.slice(0, 5)}`;
	}

	let chatMessages = $state<{ id: string; username: string; content: string }[]>([]);
	let chatSocket: WebSocket | null = null;

	async function fetchChatHistory() {
		try {
			const data = await getHistoryChat(live.id);
			
			chatMessages = (data.messages ?? []).map(
				(m: { viewerId: string; content: string }, i: number) => ({
					id: `history-${i}`,
					username: labelFor(m.viewerId),
					content: m.content
				})
			);
		} catch {
			// silencieux
		}
	}

// À ajouter au début de ton <script>, avec tes autres variables
let heartbeatInterval;
// On génère un ID unique pour l'admin, ou tu peux utiliser un ID fixe si tu préfères
const currentViewerId = "admin-" + crypto.randomUUID().slice(0, 8); 

function connectChatSocket() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://localhost:8080/ws/telemetry`;
    
    chatSocket = new WebSocket(wsUrl);

    chatSocket.onopen = () => {
        console.log("✅ WebSocket connecté !");

        // 1. Fonction pour envoyer le heartbeat
        const sendHeartbeat = () => {
            if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                const heartbeatPayload = {
                    type: "heartbeat",
                    streamId: live.id, // On utilise l'ID du live actuel
                    viewerId: currentViewerId
                };
                
                chatSocket.send(JSON.stringify(heartbeatPayload));
                console.log("💓 Heartbeat envoyé :", heartbeatPayload);
            }
        };

        // 2. On l'envoie immédiatement pour s'inscrire au flux du chat
        sendHeartbeat();

        // 3. On le renvoie toutes les 30 secondes (30000 ms) pour garder la connexion active
        heartbeatInterval = setInterval(sendHeartbeat, 30000);
    };

    chatSocket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            console.log("📥 Message reçu :", msg);
            
            if (msg.type !== 'chat') return;
            
            chatMessages = [...chatMessages, {
                id: crypto.randomUUID(),
                username: labelFor(msg.viewerId),
                content: msg.content
            }];
        } catch (err) {
            console.error("Erreur de parsing :", err);
        }
    };

    chatSocket.onerror = (error) => {
        console.error("❌ Erreur WebSocket :", error);
    };

    chatSocket.onclose = () => {
        console.warn("⚠️ WebSocket déconnecté.");
        // On arrête d'envoyer le heartbeat si la connexion est fermée
        clearInterval(heartbeatInterval);
    };
}

	onMount(() => {
		fetchViewerCount();
		fetchChatHistory();
		connectChatSocket();

		viewerInterval = setInterval(fetchViewerCount, 10000);

		return () => {
			clearInterval(viewerInterval);
			chatSocket?.close();
		};
	});
</script>

{#snippet credentialField(label: string, value: string, field: string)}
	<div class="grid gap-1.5">
		<span class="text-muted-foreground text-sm">{label}</span>
		<div class="flex items-center gap-2">
			<code class="bg-muted flex-1 truncate rounded-md px-3 py-2 text-sm">{value}</code>
			<Button
				variant="outline"
				size="icon"
				class="shrink-0"
				onclick={() => copy(value, field)}
			>
				{#if copiedField === field}
					<CheckIcon class="size-4 text-green-600" />
				{:else}
					<CopyIcon class="size-4" />
				{/if}
			</Button>
		</div>
	</div>
{/snippet}

<div class="mx-auto w-full space-y-8 p-6">
	<div class="flex items-start justify-between gap-4">
		<div class="space-y-1.5">
			<h1 class="text-2xl font-semibold tracking-tight">{live.title}</h1>
			<div class="flex items-center gap-2">
				<Badge variant={isLive ? 'default' : 'secondary'} class="gap-1.5">
					{#if isLive}
						<span class="relative flex size-1.5">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"
							></span>
							<span class="relative inline-flex size-1.5 rounded-full bg-white"></span>
						</span>
					{/if}
					{live.status}
				</Badge>
				{#if viewerCount !== null}
					<span class="text-muted-foreground flex items-center gap-1 text-sm">
						<UsersIcon class="size-3.5" />
						{viewerCount}
					</span>
				{/if}
				{#if live.schedule_at}
					<span class="text-muted-foreground text-sm">
						Programmé pour {new Date(live.schedule_at).toLocaleString()}
					</span>
				{/if}
			</div>
		</div>

		<!-- {#if isLive} -->
			<Button variant="destructive" size="sm" class="gap-1.5" onclick={() => (showEndDialog = true)}>
				<SquareIcon class="size-3.5" />
				Clôturer le live
			</Button>
		<!-- {/if} -->
	</div>

	{#if endError}
		<p class="text-destructive text-sm">{endError}</p>
	{/if}

	<div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
		<div class="min-w-0 flex-1 overflow-hidden rounded-xl border">
			<LivePlayer playbackId={liveStream.playback_id} title={live.title} />
		</div>

		<div class="flex w-full shrink-0 lg:w-[340px]">
			<LiveChat messages={chatMessages} viewerCount={viewerCount ?? undefined} />
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Configuration OBS</Card.Title>
			<Card.Description>Utilise ces informations pour démarrer ton stream.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-5">
			{@render credentialField('URL du serveur (RTMP)', live.rtmp_url, 'rtmp')}
			{@render credentialField('Clé de stream', live.stream_key, 'key')}
		</Card.Content>
	</Card.Root>
</div>

<AlertDialog.Root bind:open={showEndDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Clôturer ce live ?</AlertDialog.Title>
			<AlertDialog.Description>
				Cette action est irréversible. Le live passera au statut "terminé" et ne pourra plus être
				redémarré.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isEnding}>Annuler</AlertDialog.Cancel>
			<AlertDialog.Action onclick={endLive} disabled={isEnding}>
				{isEnding ? 'Clôture...' : 'Clôturer'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>