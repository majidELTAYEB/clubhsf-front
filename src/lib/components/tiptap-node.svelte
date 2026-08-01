<!-- src/lib/components/tiptap-node.svelte -->
<script lang="ts">
	import Self from './tiptap-node.svelte';
	import MarkedText from './tiptap-marked-text.svelte';

	export type TiptapNode = {
		type: string;
		attrs?: Record<string, unknown>;
		content?: TiptapNode[];
		text?: string;
		marks?: { type: string; attrs?: Record<string, unknown> }[];
	};

	let { node }: { node: TiptapNode } = $props();

	let children = $derived(node.content ?? []);

	// Tiptap autorise des niveaux de heading > 3, on les ramène à h3 max
	// pour rester dans la hiérarchie visuelle du site.
	let headingLevel = $derived(Math.min(3, Number(node.attrs?.level ?? 1)));
</script>

{#if node.type === 'text'}
	<MarkedText text={node.text ?? ''} marks={node.marks ?? []} />

{:else if node.type === 'paragraph'}
	<p>{#each children as child}<Self node={child} />{/each}</p>

{:else if node.type === 'heading' && headingLevel === 1}
	<h1>{#each children as child}<Self node={child} />{/each}</h1>
{:else if node.type === 'heading' && headingLevel === 2}
	<h2>{#each children as child}<Self node={child} />{/each}</h2>
{:else if node.type === 'heading'}
	<h3>{#each children as child}<Self node={child} />{/each}</h3>

{:else if node.type === 'bulletList'}
	<ul>{#each children as child}<Self node={child} />{/each}</ul>
{:else if node.type === 'orderedList'}
	<ol>{#each children as child}<Self node={child} />{/each}</ol>
{:else if node.type === 'listItem'}
	<li>{#each children as child}<Self node={child} />{/each}</li>

{:else if node.type === 'taskList'}
	<ul data-type="taskList">{#each children as child}<Self node={child} />{/each}</ul>
{:else if node.type === 'taskItem'}
	<li>
		<input type="checkbox" checked={Boolean(node.attrs?.checked)} disabled />
		{#each children as child}<Self node={child} />{/each}
	</li>

{:else if node.type === 'blockquote'}
	<blockquote>{#each children as child}<Self node={child} />{/each}</blockquote>

{:else if node.type === 'codeBlock'}
	<pre><code>{#each children as child}<Self node={child} />{/each}</code></pre>

{:else if node.type === 'horizontalRule'}
	<hr />

{:else if node.type === 'hardBreak'}
	<br />

{:else if node.type === 'image'}
	<img
		src={node.attrs?.src as string}
		alt={(node.attrs?.alt as string) ?? ''}
		title={(node.attrs?.title as string) ?? ''}
	/>

{:else}
	<!-- Type de nœud inconnu (extension custom non gérée ci-dessus) —
	     on rend quand même les enfants pour ne rien perdre silencieusement. -->
	{#each children as child}<Self node={child} />{/each}
{/if}