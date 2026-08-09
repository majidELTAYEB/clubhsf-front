<!-- src/lib/components/tiptap-marked-text.svelte -->
<script lang="ts">
	type Mark = { type: string; attrs?: Record<string, unknown> };

	let { text, marks = [] }: { text: string; marks?: Mark[] } = $props();

	let [first, ...rest] = marks;
</script>

{#if !first}
	{text}
{:else if first.type === 'bold'}
	<strong><svelte:self {text} marks={rest} /></strong>
{:else if first.type === 'italic'}
	<em><svelte:self {text} marks={rest} /></em>
{:else if first.type === 'strike'}
	<s><svelte:self {text} marks={rest} /></s>
{:else if first.type === 'code'}
	<code><svelte:self {text} marks={rest} /></code>
{:else if first.type === 'link'}
	<a href={first.attrs?.href as string} target="_blank" rel="noopener noreferrer">
		<svelte:self {text} marks={rest} />
	</a>
{:else}
	<svelte:self {text} marks={rest} />
{/if}