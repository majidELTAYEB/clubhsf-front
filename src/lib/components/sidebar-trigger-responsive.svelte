<!-- src/lib/components/sidebar-trigger-responsive.svelte -->
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import MenuIcon from "@lucide/svelte/icons/menu";
	import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
</script>

<!--
	Le vrai Sidebar.Trigger reste fonctionnel (même onclick, même contexte interne),
	on masque juste SON icône et on affiche la nôtre par-dessus, en pointer-events: none,
	pour ne pas gêner le clic.
-->
<div class="sidebar-trigger-wrap cursor-pointer">
	<Sidebar.Trigger class="sidebar-trigger-wrap__hit" />
	<span class="sidebar-trigger-wrap__icons" aria-hidden="true">
		<MenuIcon class="sidebar-trigger-wrap__icon sidebar-trigger-wrap__icon--mobile" size={18} strokeWidth={1.75} />
		<PanelLeftIcon class="sidebar-trigger-wrap__icon sidebar-trigger-wrap__icon--desktop" size={18} strokeWidth={1.75} />
	</span>
</div>

<style>
	.sidebar-trigger-wrap {
		position: relative;
		display: inline-flex;
		width: 2.25rem;
		height: 2.25rem;
	}

	/* Le bouton réel : cliquable, mais son icône interne est invisible */
	:global(.sidebar-trigger-wrap__hit) {
		position: absolute !important;
		inset: 0 !important;
		width: 100% !important;
		height: 100% !important;
		display: flex !important;
		align-items: center;
		justify-content: center;
		background: transparent !important;
		border-radius: 0 !important;
	}
	:global(.sidebar-trigger-wrap__hit svg) {
		opacity: 0 !important;
	}

	/* Nos icônes à nous, purement visuelles */
	.sidebar-trigger-wrap__icons {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		color: #121210;
	}

	:global(.sidebar-trigger-wrap__icon--desktop) {
		display: none;
	}
	:global(.sidebar-trigger-wrap__icon--mobile) {
		display: block;
	}

	@media (min-width: 768px) {
		:global(.sidebar-trigger-wrap__icon--mobile) {
			display: none;
		}
		:global(.sidebar-trigger-wrap__icon--desktop) {
			display: block;
		}
	}
</style>