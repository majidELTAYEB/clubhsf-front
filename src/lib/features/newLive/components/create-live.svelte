<!-- <script lang="ts">
	import { MediaQuery } from "svelte/reactivity";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import DateTimePicker from "./date-time-picker.svelte";
	import { newLive } from "../api";
	import { getMe } from "$lib/features/auth/api";
	import { Spinner } from "$lib/components/ui/spinner";

	let { open = $bindable(false) }: { open?: boolean } = $props();
	const isDesktop = new MediaQuery("(min-width: 768px)");
	const id = $props.id();

	let title = $state("");
	let description = $state("");
	let scheduleAt = $state();
	let submitting = $state(false);

    function resetForm() {
		title = "";
		description = "";
		scheduleAt = "";
	}

	$effect(() => {
		if (!open) {
			resetForm();
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		const payload = {
			title,
			description: description.trim() === "" ? undefined : description,
			schedule_at: scheduleAt === "" ? undefined : new Date(scheduleAt).toISOString()
		};

		try {
			const response = await newLive(payload)
			const r = await getMe()
			
			open = false;
		} finally {
			submitting = false;
		}
	}
</script>

{#snippet formFields()}
	<div class="grid gap-3">
		<Label for="title-{id}">Titre</Label>
		<Input id="title-{id}" bind:value={title} placeholder="Titre du live" required />
	</div>
	<div class="grid gap-3">
		<Label for="description-{id}">Description</Label>
		<Textarea
			id="description-{id}"
			bind:value={description}
			placeholder="Décris ton live (optionnel)"
			rows={3}
		/>
	</div>
	<div class="grid gap-3">
		<Label for="schedule-{id}">Programmer pour</Label>
		<DateTimePicker bind:value={scheduleAt} id="schedule-{id}"/>
	</div>
    
{/snippet}

{#if isDesktop.current}
	<Dialog.Root bind:open>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Nouveau live</Dialog.Title>
				<Dialog.Description>
					Configure ton live. Tu peux le démarrer maintenant ou le programmer.
				</Dialog.Description>
			</Dialog.Header>
			<form class="grid items-start gap-6 pt-2" onsubmit={handleSubmit}>
				{@render formFields()}
				<Button type="submit" disabled={submitting || title.trim() === ""}>
	{#if submitting}
		<Spinner class="size-4" />
		Création…
	{:else}
		Créer le live
	{/if}
</Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		<Drawer.Content>
			<Drawer.Header class="text-start">
				<Drawer.Title>Nouveau live</Drawer.Title>
				<Drawer.Description>
					Configure ton live. Tu peux le démarrer maintenant ou le programmer.
				</Drawer.Description>
			</Drawer.Header>
			<form class="grid items-start gap-6 px-4 pt-2" onsubmit={handleSubmit}>
				{@render formFields()}
				<Button type="submit" disabled={submitting || title.trim() === ""}>
	{#if submitting}
		<Spinner class="size-4" />
		Création…
	{:else}
		Créer le live
	{/if}
</Button>
			</form>
			<Drawer.Footer class="pt-2">
				<Drawer.Close class={buttonVariants({ variant: "outline" })}>Annuler</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if} -->

<script lang="ts">
	import { MediaQuery } from "svelte/reactivity";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import DateTimePicker from "./date-time-picker.svelte";
	import { newLive } from "../api";
	import { Spinner } from "$lib/components/ui/spinner";
	import * as Alert from "$lib/components/ui/alert/index.js";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";

	let { open = $bindable(false) }: { open?: boolean } = $props();
	const isDesktop = new MediaQuery("(min-width: 768px)");
	const id = $props.id();

	let title = $state("");
	let description = $state("");
	let scheduleAt = $state();
	let submitting = $state(false);
	let error = $state<string | null>(null);

	function resetForm() {
		title = "";
		description = "";
		scheduleAt = "";
		error = null;
	}

	$effect(() => {
		if (!open) {
			resetForm();
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;
		error = null;

		const payload = {
			title,
			description: description.trim() === "" ? undefined : description,
			schedule_at: scheduleAt === "" ? undefined : new Date(scheduleAt).toISOString()
		};

		try {
			await newLive(payload);
			open = false;
			await goto(resolve(`/admin/live/${live.id}`));
		} catch (err) {
			error = err instanceof Error ? err.message : "Une erreur est survenue, réessaie.";
		} finally {
			submitting = false;
		}
	}
</script>

{#snippet formFields()}
	<div class="grid gap-3">
		<Label for="title-{id}">Titre</Label>
		<Input id="title-{id}" bind:value={title} placeholder="Titre du live" required />
	</div>
	<div class="grid gap-3">
		<Label for="description-{id}">Description</Label>
		<Textarea
			id="description-{id}"
			bind:value={description}
			placeholder="Décris ton live (optionnel)"
			rows={3}
		/>
	</div>
	<div class="grid gap-3">
		<Label for="schedule-{id}">Programmer pour</Label>
		<DateTimePicker bind:value={scheduleAt} id="schedule-{id}" />
	</div>

	{#if error}
		<Alert.Root variant="destructive">
			<AlertCircleIcon />
			<Alert.Title>Impossible de créer le live</Alert.Title>
			<Alert.Description>{error}</Alert.Description>
		</Alert.Root>
	{/if}
{/snippet}

{#snippet submitButton()}
	<Button type="submit" disabled={submitting || title.trim() === ""}>
		{#if submitting}
			<Spinner class="size-4" />
			Création…
		{:else}
			Créer le live
		{/if}
	</Button>
{/snippet}

{#if isDesktop.current}
	<Dialog.Root bind:open>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Nouveau live</Dialog.Title>
				<Dialog.Description>
					Configure ton live. Tu peux le démarrer maintenant ou le programmer.
				</Dialog.Description>
			</Dialog.Header>
			<form class="grid items-start gap-6 pt-2" onsubmit={handleSubmit}>
				{@render formFields()}
				{@render submitButton()}
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		<Drawer.Content>
			<Drawer.Header class="text-start">
				<Drawer.Title>Nouveau live</Drawer.Title>
				<Drawer.Description>
					Configure ton live. Tu peux le démarrer maintenant ou le programmer.
				</Drawer.Description>
			</Drawer.Header>
			<form class="grid items-start gap-6 px-4 pt-2" onsubmit={handleSubmit}>
				{@render formFields()}
				{@render submitButton()}
			</form>
			<Drawer.Footer class="pt-2">
				<Drawer.Close class={buttonVariants({ variant: "outline" })}>Annuler</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}