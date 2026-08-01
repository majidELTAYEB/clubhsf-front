<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import TiptapContent from '$lib/components/tiptap-content.svelte';
	import type { TiptapNode } from '$lib/components/tiptap-node.svelte';

	type Article = {
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		content: TiptapNode;
		is_public: boolean;
		created_at: string;
		updated_at: string;
	};

	let { data }: { data: { article: Article } } = $props();
	let article = $derived(data.article);

	function extractText(node: TiptapNode): string {
		if (node.type === 'text') return node.text ?? '';
		return (node.content ?? []).map(extractText).join(' ');
	}

	function readingTime(doc: TiptapNode) {
		const words = extractText(doc).trim().split(/\s+/).filter(Boolean).length;
		return Math.max(1, Math.round(words / 200));
	}
</script>

<svelte:head>
	<title>{article.title}</title>
	{#if article.excerpt}
		<meta name="description" content={article.excerpt} />
	{/if}
</svelte:head>

<div class="archive">
	<div class="masthead">
		<a href="/masterclass" class="back-link">
			<ArrowLeftIcon size={13} strokeWidth={1.75} />
			<span>Articles</span>
		</a>
	</div>

	<article class="archive__inner">
		<header class="heading">
			<h1 class="title">{article.title}</h1>
			<div class="byline">
				<span>{new Date(article.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
				<span class="byline__dot">&middot;</span>
				<span>{readingTime(article.content)} min de lecture</span>
			</div>
			{#if article.excerpt}
				<p class="excerpt">{article.excerpt}</p>
			{/if}
		</header>

		<div class="body">
			<TiptapContent content={article.content} />
		</div>
	</article>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.archive {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		background: var(--bg);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		min-height: 100%;
	}

	.masthead {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--fg);
		text-decoration: none;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: opacity 0.2s ease;
	}
	.back-link:hover { opacity: 0.55; }

	.archive__inner {
		max-width: 720px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
	}

	.heading {
		padding-bottom: 1.75rem;
		border-bottom: 1px solid var(--border);
	}

	.title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: clamp(2rem, 5vw, 2.9rem);
		line-height: 1.15;
		letter-spacing: -0.01em;
	}

	.byline {
		margin-top: 1rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--muted);
	}
	.byline__dot { margin: 0 0.4rem; }

	.excerpt {
		margin-top: 1.25rem;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 1.1rem;
		line-height: 1.5;
		color: var(--muted);
		max-width: 56ch;
	}

	.body {
		margin-top: 2.5rem;
	}
</style>