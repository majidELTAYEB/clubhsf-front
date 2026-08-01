<!-- src/lib/components/tiptap-content.svelte -->
<script lang="ts">
	import TiptapNode, { type TiptapNode as TiptapNodeType } from './tiptap-node.svelte';

	// Le document racine Tiptap ({ type: 'doc', content: [...] })
	let { content }: { content: TiptapNodeType } = $props();

	let children = $derived(content?.content ?? []);
</script>

<div class="prose">
	{#each children as child}
		<TiptapNode node={child} />
	{/each}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.prose {
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		font-family: 'Inter', sans-serif;
		font-size: 1.02rem;
		line-height: 1.75;
		color: #2b2a26;
	}

	.prose :global(p) {
		margin: 0 0 1.4rem;
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3) {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		color: var(--fg);
		line-height: 1.25;
		margin: 2.5rem 0 1rem;
	}
	.prose :global(h1) { font-size: 1.9rem; }
	.prose :global(h2) { font-size: 1.55rem; }
	.prose :global(h3) { font-size: 1.25rem; }
	.prose :global(h1:first-child),
	.prose :global(h2:first-child),
	.prose :global(h3:first-child) { margin-top: 0; }

	.prose :global(a) {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.prose :global(strong) { font-weight: 600; color: var(--fg); }
	.prose :global(em) { font-style: italic; }

	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 1.4rem;
		padding-left: 1.4rem;
	}
	.prose :global(li) { margin: 0.4rem 0; }
	.prose :global(ul) { list-style: disc; }
	.prose :global(ol) { list-style: decimal; }
	.prose :global(li)::marker { color: var(--accent); }

	.prose :global(blockquote) {
		margin: 1.75rem 0;
		padding: 0.25rem 0 0.25rem 1.25rem;
		border-left: 2px solid var(--accent);
		font-family: 'Fraunces', serif;
		font-style: italic;
		color: var(--muted);
	}
	.prose :global(blockquote p) { margin: 0.4rem 0; }

	.prose :global(hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 2.5rem 0;
	}

	.prose :global(code) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85em;
		background: #f8f7f3;
		border: 1px solid var(--border);
		padding: 0.15em 0.4em;
	}

	.prose :global(pre) {
		background: #121210;
		color: #f3f1ea;
		padding: 1.1rem 1.25rem;
		overflow-x: auto;
		margin: 1.75rem 0;
	}
	.prose :global(pre code) {
		background: none;
		border: none;
		padding: 0;
		color: inherit;
		font-size: 0.85rem;
	}

	.prose :global(img) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 2rem 0;
	}

	.prose :global(ul[data-type="taskList"]) {
		list-style: none;
		padding-left: 0;
	}
	.prose :global(ul[data-type="taskList"] li) {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
	}
	.prose :global(ul[data-type="taskList"] input[type="checkbox"]) {
		margin-top: 0.35rem;
		accent-color: var(--accent);
	}
</style>