<!-- src/lib/components/live-error.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';

	let {
		title = 'Une erreur est survenue',
		message = "Impossible de charger ce live pour le moment.",
		onRetry
	}: {
		title?: string;
		message?: string;
		onRetry?: () => void;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 rounded-xl border py-16 text-center">
	<div class="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
		<AlertTriangleIcon class="text-destructive size-6" />
	</div>
	<div class="space-y-1">
		<p class="font-medium">{title}</p>
		<p class="text-muted-foreground text-sm">{message}</p>
	</div>
	{#if onRetry}
		<Button variant="outline" size="sm" onclick={onRetry}>Réessayer</Button>
	{/if}
</div>