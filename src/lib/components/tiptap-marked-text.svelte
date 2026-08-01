<!-- src/lib/components/tiptap-marked-text.svelte -->
<script lang="ts">
	import Self from './tiptap-marked-text.svelte';

	type Mark = { type: string; attrs?: Record<string, unknown> };

	let { text, marks = [] }: { text: string; marks?: Mark[] } = $props();

	let [first, ...rest] = marks;
</script>

{#if !first}
	{text}
{:else if first.type === 'bold'}
	<strong><Self {text} marks={rest} /></strong>
{:else if first.type === 'italic'}
	<em><Self {text} marks={rest} /></em>
{:else if first.type === 'strike'}
	<s><Self {text} marks={rest} /></s>
{:else if first.type === 'code'}
	<code><Self {text} marks={rest} /></code>
{:else if first.type === 'link'}
	<a href={first.attrs?.href as string} target="_blank" rel="noopener noreferrer">
		<Self {text} marks={rest} />
	</a>
{:else}
	<Self {text} marks={rest} />
{/if}