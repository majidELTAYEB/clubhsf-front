<!-- <script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CopyIcon from '@lucide/svelte/icons/copy';

    import LivePlayer from '$lib/components/live-player.svelte';

    

	let { data }: { data: PageData } = $props();
	const live = data.live;

    let liveStream = $derived(live);

	let copiedField = $state<string | null>(null);

	async function copy(value: string, field: string) {
		await navigator.clipboard.writeText(value);
		copiedField = field;
		setTimeout(() => (copiedField = null), 1500);
	}
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">{live.title}</h1>
			<Badge variant={live.status === 'live' ? 'default' : 'secondary'} class="mt-2">
				{live.status}
			</Badge>
		</div>
	</div>

    <LivePlayer playbackId={liveStream.playback_id} title="Mon Live" />

	<Card.Root>
		<Card.Header>
			<Card.Title>Configuration OBS</Card.Title>
			<Card.Description>Utilise ces informations pour démarrer ton stream.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-2">
				<span class="text-muted-foreground text-sm">URL du serveur (RTMP)</span>
				<div class="flex items-center gap-2">
					<code class="bg-muted flex-1 truncate rounded-md px-3 py-2 text-sm">{live.rtmp_url}</code>
					<Button variant="outline" size="icon" onclick={() => copy(live.rtmp_url, 'rtmp')}>
						<CopyIcon class="size-4" />
					</Button>
				</div>
				{#if copiedField === 'rtmp'}
					<span class="text-xs text-green-600">Copié</span>
				{/if}
			</div>

			<div class="grid gap-2">
				<span class="text-muted-foreground text-sm">Clé de stream</span>
				<div class="flex items-center gap-2">
					<code class="bg-muted flex-1 truncate rounded-md px-3 py-2 text-sm">{live.stream_key}</code>
					<Button variant="outline" size="icon" onclick={() => copy(live.stream_key, 'key')}>
						<CopyIcon class="size-4" />
					</Button>
				</div>
				{#if copiedField === 'key'}
					<span class="text-xs text-green-600">Copié</span>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	{#if live.schedule_at}
		<p class="text-muted-foreground text-sm">
			Programmé pour {new Date(live.schedule_at).toLocaleString()}
		</p>
	{/if}
</div> -->

<script lang="ts">
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
</div>