<script lang="ts">
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import TiptapContent from '$lib/components/tiptap-content.svelte';
	import type { TiptapNode } from '$lib/components/tiptap-node.svelte';

	type Article = {
		id: string;
		title: string;
		slug: string;
		excerpt: string | null;
		content: TiptapNode;
		cover_image_url: string | null;
		is_public: boolean;
		created_at: string;
		updated_at: string;
	};

	type NextArticle = {
		article_id: string;
		title: string;
		slug: string;
		excerpt?: string | null;
		cover_image_url?: string | null;
		position: number;
	};

	let { data }: { data: { article: Article; nextArticle: NextArticle | null; collectionId: string | null } } = $props();
	let article = $derived(data.article);
	let nextArticle = $derived(data.nextArticle);

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
                <button type="button" on:click={() => history.back()} class="back-link">
            <ArrowLeftIcon size={13} strokeWidth={1.75} />
            <span>Retour</span>
        </button>
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

		{#if article.cover_image_url}
			<div class="cover">
				<img src={article.cover_image_url} alt={article.title} />
			</div>
		{/if}

		<div class="body">
			<TiptapContent content={article.content} />
		</div>

		{#if nextArticle}
			<aside class="next">
				<span class="eyebrow">Ensuite</span>
				<a href="/article/{nextArticle.article.slug}?collection={data.collectionId}" class="next-entry">
					{#if nextArticle.article.cover_image_url}
						<div class="next-entry__thumb">
							<img src={nextArticle.article.cover_image_url} alt={nextArticle.title} />
						</div>
					{/if}
					<div class="next-entry__text">
						<span class="next-entry__title">{nextArticle.article.title}</span>
						{#if nextArticle.article.excerpt}
							<span class="next-entry__excerpt">{nextArticle.article.excerpt}</span>
						{/if}
						<span class="next-entry__cta">Lire <ArrowRightIcon size={12} strokeWidth={1.75} /></span>
					</div>
				</a>
			</aside>
		{/if}
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

	.cover {
		margin-top: 2.5rem;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.body {
		margin-top: 2.5rem;
	}

	/* Article suivant */
	.next {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}

	.eyebrow {
		display: block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 1rem;
	}

	.next-entry {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		text-decoration: none;
		color: inherit;
	}

	.next-entry__thumb {
		width: 6.5rem;
		aspect-ratio: 4 / 3;
		flex-shrink: 0;
		overflow: hidden;
	}
	.next-entry__thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transition: filter 0.4s ease;
	}
	.next-entry:hover .next-entry__thumb img {
		filter: grayscale(0);
	}

	.next-entry__text {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}
	.next-entry__title {
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-size: 1.15rem;
		line-height: 1.3;
	}
	.next-entry__excerpt {
		font-size: 0.82rem;
		line-height: 1.4;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.next-entry__cta {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.15rem;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
	}
</style>