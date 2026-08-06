<!-- src/lib/features/profile/components/profile-goals-editor.svelte -->
<script lang="ts">
	import { updateGoals } from '$lib/features/profile/api';
	import type { Goal } from '$lib/features/profile/types';
	import LoaderIcon from "@lucide/svelte/icons/loader";

	let {
		goalsCatalog,
		selectedGoalIds: initialSelectedGoalIds,
		onUpdated,
		onClose
	}: {
		goalsCatalog: Goal[];
		selectedGoalIds: string[];
		onUpdated: () => void | Promise<void>;
		onClose?: () => void;
	} = $props();

	let selectedGoalIds = $state<string[]>([...initialSelectedGoalIds]);
	let saving = $state(false);
	let errorMsg = $state<string | null>(null);

	function toggleGoal(id: string) {
		selectedGoalIds = selectedGoalIds.includes(id)
			? selectedGoalIds.filter((g) => g !== id)
			: [...selectedGoalIds, id];
	}

	async function saveGoals() {
		saving = true;
		errorMsg = null;
		try {
			await updateGoals(selectedGoalIds);
			await onUpdated();
			// Contrairement aux modales Infos/Photos (plusieurs sous-actions
			// indépendantes), celle-ci n'a qu'une seule action : une fois validée,
			// il n'y a plus rien à faire ici, autant fermer directement.
			onClose?.();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Échec de la sauvegarde';
		} finally {
			saving = false;
		}
	}
</script>

<div class="field-group">
	<span class="eyebrow">Objectifs</span>

	<div class="goals-grid">
		{#each goalsCatalog as goal (goal.id)}
			{@const isSelected = selectedGoalIds.includes(goal.id)}
			<button
				type="button"
				class="goal-square"
				class:goal-square--active={isSelected}
				onclick={() => toggleGoal(goal.id)}
				aria-pressed={isSelected}
			>
				{goal.label}
			</button>
		{/each}
	</div>

	{#if errorMsg}
		<p class="error-msg">{errorMsg}</p>
	{/if}

	<button type="button" class="save-button" onclick={saveGoals} disabled={goalsCatalog.length === 0 || saving}>
		{#if saving}
			<LoaderIcon size={13} strokeWidth={2} class="spin" />
		{/if}
		{saving ? 'Enregistrement…' : 'Enregistrer les objectifs'}
	</button>
</div>

<style>
	.field-group {
		--bg: #ffffff;
		--fg: #121210;
		--muted: #77746c;
		--border: #e6e3db;
		--accent: #b23a1f;

		font-family: 'Inter', sans-serif;
	}

	.eyebrow {
		display: block;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.9rem;
	}

	.goals-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.goal-square {
		padding: 0.6rem 0.9rem;
		background: var(--bg);
		border: 1px solid var(--border);
		color: var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		cursor: pointer;
		transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
	}
	.goal-square:hover {
		border-color: var(--fg);
	}
	.goal-square--active {
		background: var(--fg);
		border-color: var(--fg);
		color: #fff;
	}

	.error-msg {
		margin: 0.5rem 0 0;
		font-size: 0.75rem;
		color: var(--accent);
	}

	.save-button {
		width: 100%;
		margin-top: 0.75rem;
		padding: 0.65rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: var(--fg);
		color: #fff;
		border: 1px solid var(--fg);
		font-family: 'Inter', sans-serif;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
	}
	.save-button:disabled { opacity: 0.4; cursor: not-allowed; }

	:global(.spin) {
		animation: profile-spin 0.8s linear infinite;
	}
	@keyframes profile-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.spin) { animation: none; }
	}
</style>