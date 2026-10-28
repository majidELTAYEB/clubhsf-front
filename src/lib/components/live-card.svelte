<!-- 
<script lang="ts">
	let {
		id,
		title,
		coverSrc,
		status,
		scheduleAt
	}: {
		id: string;
		title: string;
		coverSrc: string;
		status: string;
		scheduleAt?: string | null;
	} = $props();

	function timeUntil(dateStr: string): string {
		const diffMs = new Date(dateStr).getTime() - Date.now();
		if (diffMs <= 0) return 'bientôt';

		const minutes = Math.floor(diffMs / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `dans ${days} j`;
		if (hours > 0) return `dans ${hours} h`;
		return `dans ${minutes} min`;
	}

	let isScheduled = $derived(status === 'scheduled');
	let isActive = $derived(status === 'active');
	let isDisconnected = $derived(status === 'disconnected');
	let isInactive = $derived(status === 'ended' || status === 'canceled');
	let countdown = $derived(scheduleAt ? timeUntil(scheduleAt) : null);
</script>

<svelte:element
	this={isInactive ? 'div' : 'a'}
	class="live-tile"
	class:live-tile--dim={isScheduled || isInactive}
	class:live-tile--disabled={isInactive}
	href={isInactive ? undefined : `/lives/${id}`}
	aria-disabled={isInactive}
>
	<img
		class="live-tile__img"
		src={coverSrc}
		alt="Cover du live {title}"
		loading="lazy"
	/>

	<span class="live-tile__badge" class:live-tile__badge--live={isActive}>
		{#if isActive}
			<span class="live-tile__pulse">
				<span class="live-tile__pulse-ring"></span>
				<span class="live-tile__pulse-dot"></span>
			</span>
			En direct
		{:else if isDisconnected}
			Reconnexion&hellip;
		{:else if isScheduled}
			{countdown ?? 'Programmé'}
		{:else}
			{status === 'canceled' ? 'Annulé' : 'Terminé'}
		{/if}
	</span>

	<div class="live-tile__scrim">
		<p class="live-tile__title">{title}</p>
		{#if scheduleAt}
			<p class="live-tile__date">
				{new Date(scheduleAt).toLocaleString('fr-FR', {
					day: 'numeric',
					month: 'long',
					hour: '2-digit',
					minute: '2-digit'
				})}
			</p>
		{/if}
	</div>
</svelte:element>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

	.live-tile {
		--accent: #b23a1f;

		position: relative;
		display: block;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		background: #100f0d;
		text-decoration: none;
		color: inherit;
		font-family: 'Inter', sans-serif;
	}

	.live-tile--disabled {
		cursor: not-allowed;
	}

	.live-tile__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(0) contrast(1.03) brightness(0.94);
		transition: filter 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.live-tile--dim .live-tile__img {
		filter: grayscale(1) contrast(1.03) brightness(0.75);
	}
	.live-tile:not(.live-tile--disabled):hover .live-tile__img {
		transform: scale(1.045);
	}

	/* Badge statut */
	.live-tile__badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.55rem;
		background: rgba(9, 9, 8, 0.65);
		backdrop-filter: blur(2px);
		color: #fff;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.62rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.live-tile__badge--live {
		background: var(--accent);
	}

	.live-tile__pulse {
		position: relative;
		display: inline-flex;
		width: 0.4rem;
		height: 0.4rem;
	}
	.live-tile__pulse-ring {
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		background: #fff;
		opacity: 0.75;
		animation: live-tile-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	.live-tile__pulse-dot {
		position: relative;
		display: block;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: #fff;
	}
	@keyframes live-tile-ping {
		75%, 100% {
			transform: scale(2.2);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.live-tile__pulse-ring { animation: none; }
	}

	/* Scrim + texte */
	.live-tile__scrim {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 3rem 0.9rem 0.9rem;
		background: linear-gradient(to top, rgba(9, 9, 8, 0.92) 0%, rgba(9, 9, 8, 0.5) 55%, rgba(9, 9, 8, 0) 100%);
	}

	.live-tile__title {
		color: #fff;
		font-family: 'Fraunces', serif;
		font-style: italic;
		font-weight: 500;
		font-size: 1rem;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.live-tile__date {
		margin-top: 0.35rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.03em;
		color: rgba(255, 255, 255, 0.6);
	}
</style> -->


<!-- src/lib/components/live-card.svelte -->
<script lang="ts">
	let {
		id,
		title,
		coverSrc,
		status,
		scheduleAt
	}: {
		id: string;
		title: string;
		coverSrc: string;
		status: string;
		scheduleAt?: string | null;
	} = $props();

	function timeUntil(dateStr: string): string {
		const diffMs = new Date(dateStr).getTime() - Date.now();
		if (diffMs <= 0) return 'bientôt';

		const minutes = Math.floor(diffMs / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `dans ${days} j`;
		if (hours > 0) return `dans ${hours} h`;
		return `dans ${minutes} min`;
	}

	let isScheduled = $derived(status === 'scheduled');
	let isActive = $derived(status === 'active');
	let isDisconnected = $derived(status === 'disconnected');
	let isInactive = $derived(status === 'ended' || status === 'canceled');
	let countdown = $derived(scheduleAt ? timeUntil(scheduleAt) : null);
</script>

<svelte:element
	this={isInactive ? 'div' : 'a'}
	class="live-tile"
	class:live-tile--dim={isScheduled || isInactive}
	class:live-tile--disabled={isInactive}
	href={isInactive ? undefined : `/lives/${id}`}
	aria-disabled={isInactive}
>
	<div class="live-tile__media">
		<img
			class="live-tile__img"
			src={coverSrc}
			alt="Cover du live {title}"
			loading="lazy"
		/>

		<span class="live-tile__badge" class:live-tile__badge--live={isActive}>
			{#if isActive}
				<span class="live-tile__pulse">
					<span class="live-tile__pulse-ring"></span>
					<span class="live-tile__pulse-dot"></span>
				</span>
				En direct
			{:else if isDisconnected}
				Reconnexion&hellip;
			{:else if isScheduled}
				{countdown ?? 'Programmé'}
			{:else}
				{status === 'canceled' ? 'Annulé' : 'Terminé'}
			{/if}
		</span>
	</div>

	<div class="live-tile__caption">
		<p class="live-tile__title">{title}</p>
		{#if scheduleAt}
			<p class="live-tile__date">
				{new Date(scheduleAt).toLocaleString('fr-FR', {
					day: 'numeric',
					month: 'long',
					hour: '2-digit',
					minute: '2-digit'
				})}
			</p>
		{/if}
	</div>
</svelte:element>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap');

	/* Visuel en haut, légende en dessous ; la carte s'inverse en noir au survol
	   (sauf si le live est terminé ou annulé) */
	.live-tile {
		--fg: #000000;
		--bg: #ffffff;
		--muted: #6a6a6a;

		display: flex;
		flex-direction: column;
		background: var(--bg);
		color: var(--fg);
		border-right: 1px solid var(--fg);
		border-bottom: 1px solid var(--fg);
		text-decoration: none;
		font-family: 'Hanken Grotesk', system-ui, sans-serif;
		transition: background-color 0.25s ease, color 0.25s ease;
	}
	.live-tile:focus-visible {
		outline: 2px solid var(--fg);
		outline-offset: -4px;
	}

	.live-tile--disabled {
		cursor: not-allowed;
	}

	.live-tile__media {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: #eee;
		border-bottom: 1px solid var(--fg);
	}

	/* En direct : en couleur. À venir / terminé : noir et blanc. */
	.live-tile__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(0) contrast(1.03);
		transition: filter 0.6s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.live-tile--dim .live-tile__img {
		filter: grayscale(1) contrast(1.03) brightness(0.9);
	}
	.live-tile:not(.live-tile--disabled):hover .live-tile__img {
		transform: scale(1.04);
	}

	/* Badge de statut : carré blanc à bordure noire, noir plein quand c'est en direct */
	.live-tile__badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0.65rem;
		background: #fff;
		color: #000;
		border: 1px solid #000;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.2;
	}
	.live-tile__badge--live {
		background: #000;
		color: #fff;
		border-color: #fff;
	}

	.live-tile__pulse {
		position: relative;
		display: inline-flex;
		width: 0.45rem;
		height: 0.45rem;
	}
	.live-tile__pulse-ring {
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		background: #fff;
		opacity: 0.75;
		animation: live-tile-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	.live-tile__pulse-dot {
		position: relative;
		display: block;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
		background: #fff;
	}
	@keyframes live-tile-ping {
		75%, 100% {
			transform: scale(2.2);
			opacity: 0;
		}
	}

	.live-tile__caption {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex: 1;
		padding: 1rem 1.1rem 1.25rem;
	}

	.live-tile__title {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-weight: 700;
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.live-tile__date {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted);
		text-transform: capitalize;
		transition: color 0.25s ease;
	}

	.live-tile--disabled .live-tile__title {
		color: var(--muted);
	}

	.live-tile:not(.live-tile--disabled):hover,
	.live-tile:not(.live-tile--disabled):focus-visible {
		background: var(--fg);
		color: var(--bg);
	}
	.live-tile:not(.live-tile--disabled):hover .live-tile__date,
	.live-tile:not(.live-tile--disabled):focus-visible .live-tile__date {
		color: #d0d0d0;
	}

	@media (prefers-reduced-motion: reduce) {
		.live-tile,
		.live-tile__img {
			transition: none;
		}
		.live-tile__pulse-ring {
			animation: none;
		}
		.live-tile:not(.live-tile--disabled):hover .live-tile__img {
			transform: none;
		}
	}
</style>