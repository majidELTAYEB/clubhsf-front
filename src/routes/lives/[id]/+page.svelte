<!-- src/routes/lives/[id]/+page.svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';

	import LivePlayer from '$lib/components/live-player.svelte';
	import LiveUpcoming from '$lib/components/live-upcoming.svelte';
	import LiveError from '$lib/components/live-error.svelte';

	let { data }: { data: PageData } = $props();
	let live = $derived(data.live);

	let isLive = $derived(live?.status === 'active' || live?.status === 'disconnected');
	let isScheduled = $derived(live?.status === 'scheduled');
	let isInactive = $derived(live?.status === 'ended' || live?.status === 'canceled');

	let copiedField = $state<string | null>(null);

	async function copy(value: string, field: string) {
		await navigator.clipboard.writeText(value);
		copiedField = field;
		setTimeout(() => (copiedField = null), 1500);
	}

	function formattedDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	import LiveChat from '$lib/components/live-chat.svelte';


	import { useLiveChat } from '$lib/hooks/use-live-chat.svelte';
	import { useViewerCount } from '$lib/hooks/use-viewer-count.svelte';
	import { onMount } from 'svelte';

	const viewerId = crypto.randomUUID(); // à remplacer par l'id du user connecté si dispo
	const chat = useLiveChat(live.id, viewerId);
	chat.setHistory(data.chatHistory);

		const viewerCount = useViewerCount(live.id);

	onMount(() => {
		chat.connect();
		viewerCount.start();

		return () => {
			chat.disconnect();
			viewerCount.stop();
		};
	});
</script>

{#snippet credentialField(label: string, value: string, field: string)}
	<div class="grid gap-1.5">
		<span class="text-muted-foreground text-sm">{label}</span>
		<div class="flex items-center gap-2">
			<code class="bg-muted flex-1 truncate rounded-md px-3 py-2 text-sm">{value}</code>
			<Button variant="outline" size="icon" class="shrink-0" onclick={() => copy(value, field)}>
				{#if copiedField === field}
					<CheckIcon class="size-4 text-green-600" />
				{:else}
					<CopyIcon class="size-4" />
				{/if}
			</Button>
		</div>
	</div>
{/snippet}

<div class="flex flex-col gap-6 lg:flex-row lg:items-start w-full p-6">
<div class="mx-auto space-y-6 ">
	{#if !live}
		<LiveError message="Ce live n'existe pas ou a été supprimé." onRetry={() => location.reload()} />
	{:else}
		{#if isLive}
			<div class="overflow-hidden rounded-xl border">
				<LivePlayer playbackId={live.playback_id} title={live.title} />
			</div>
		{:else if isScheduled}
			<LiveUpcoming title={live.title} coverSrc={live.cover_url} scheduleAt={live.schedule_at} />
		{:else if isInactive}
			<LiveError title="Live indisponible" message="Ce live est terminé ou a été annulé." />
		{/if}

		<div class="space-y-3">
			<h1 class="text-sm font-semibold tracking-tight">{live.title}</h1>

			<div class="flex flex-wrap items-center gap-2">
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
					<span class="text-muted-foreground text-sm">{formattedDate(live.schedule_at)}</span>
				{/if}
			</div>

			{#if live.description}
				<div class="bg-muted/50 rounded-lg p-3">
					<p class="text-sm whitespace-pre-line">{live.description}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
	<LiveChat messages={chat.messages} onSend={(content) => chat.send(content)} disabled={!chat.connected} />

</div> -->


<!-- src/routes/lives/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CheckIcon from '@lucide/svelte/icons/check';

	import LivePlayer from '$lib/components/live-player.svelte';
	import LiveUpcoming from '$lib/components/live-upcoming.svelte';
	import LiveError from '$lib/components/live-error.svelte';
	import LiveChat from '$lib/components/live-chat.svelte';
	import { useLiveChat } from '$lib/hooks/use-live-chat.svelte.ts';
	import { useViewerCount } from '$lib/hooks/use-viewer-count.svelte.ts';
	import { authState } from '$lib/features/auth/store';

	let { data }: { data: PageData } = $props();
	let live = $derived(data.live);

	

	let isLive = $derived(live?.status === 'active' || live?.status === 'disconnected');
	console.log(live)
	let isScheduled = $derived(live?.status === 'scheduled');
	let isInactive = $derived(live?.status === 'ended' || live?.status === 'canceled');

	let copiedField = $state<string | null>(null);

	async function copy(value: string, field: string) {
		await navigator.clipboard.writeText(value);
		copiedField = field;
		setTimeout(() => (copiedField = null), 1500);
	}

	function formattedDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const userName = "majid"
	const chat = useLiveChat(live.id, userName);
	chat.setHistory(data.chatHistory);

	const viewerCount = useViewerCount(live.id);

	onMount(() => {
		chat.connect();
		viewerCount.start();

		return () => {
			chat.disconnect();
			viewerCount.stop();
		};
	});
</script>

{#snippet credentialField(label: string, value: string, field: string)}
	<div class="grid gap-1.5">
		<span class="text-muted-foreground text-sm">{label}</span>
		<div class="flex items-center gap-2">
			<code class="bg-muted flex-1 truncate rounded-md px-3 py-2 text-sm">{value}</code>
			<Button variant="outline" size="icon" class="shrink-0" onclick={() => copy(value, field)}>
				{#if copiedField === field}
					<CheckIcon class="size-4 text-green-600" />
				{:else}
					<CopyIcon class="size-4" />
				{/if}
			</Button>
		</div>
	</div>
{/snippet}

<div class="w-full space-y-6 p-6">
	{#if !live}
		<LiveError message="Ce live n'existe pas ou a été supprimé." onRetry={() => location.reload()} />
	{:else}
		<div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
			<div class="min-w-0 flex-1">
				{#if isLive}
					<div class="h-full overflow-hidden rounded-xl border">
						<LivePlayer playbackId={live.playback_id} title={live.title} />
					</div>
				{:else if isScheduled}
					<LiveUpcoming title={live.title} coverSrc={live.cover_url} scheduleAt={live.schedule_at} />
				{:else if isInactive}
					<LiveError title="Live indisponible" message="Ce live est terminé ou a été annulé." />
				{/if}
			</div>

			<div class="flex w-full shrink-0 lg:w-[340px]">
				<LiveChat
					messages={chat.messages}
					onSend={(content) => chat.send(content)}
					disabled={!chat.connected}
					viewerCount={viewerCount.count}
				/>
			</div>
		</div>

		<div class="w-full space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h1 class="text-xl font-semibold tracking-tight">{live.title}</h1>
				<span class="text-muted-foreground text-sm">{viewerCount.count} spectateurs</span>
			</div>

			<div class="flex flex-wrap items-center gap-2">
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
					<span class="text-muted-foreground text-sm">{formattedDate(live.schedule_at)}</span>
				{/if}
			</div>

			{#if live.description}
				<div class="bg-muted/50 w-full rounded-lg p-3">
					<p class="text-sm whitespace-pre-line">{live.description}</p>
				</div>
			{/if}
		</div>

		{#if live.stream_key && live.rtmp_url}
			<Card.Root class="w-full">
				<Card.Header>
					<Card.Title>Configuration OBS</Card.Title>
					<Card.Description>Utilise ces informations pour démarrer ton stream.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-5">
					{@render credentialField('URL du serveur (RTMP)', live.rtmp_url, 'rtmp')}
					{@render credentialField('Clé de stream', live.stream_key, 'key')}
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>