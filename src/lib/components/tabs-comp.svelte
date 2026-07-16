<!-- src/lib/components/live-tabs.svelte -->
<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	type Tab = {
		value: string;
		label: string;
		count: number;
	};

	let {
		tabs,
		value = $bindable(tabs[0]?.value)
	}: {
		tabs: Tab[];
		value?: string;
	} = $props();
</script>

<Tabs.Root bind:value class="w-fit">
	<Tabs.List>
		{#each tabs as tab (tab.value)}
			<Tabs.Trigger value={tab.value} class="gap-1.5">
				{tab.label}
				<span
					class="bg-muted text-muted-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs tabular-nums"
				>
					{tab.count}
				</span>
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
</Tabs.Root>