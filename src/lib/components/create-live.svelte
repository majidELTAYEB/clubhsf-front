<!-- <script lang="ts">
 import { MediaQuery } from "svelte/reactivity";
 import * as Dialog from "$lib/components/ui/dialog/index.js";
 import * as Drawer from "$lib/components/ui/drawer/index.js";
 import { Input } from "$lib/components/ui/input/index.js";
 import { Label } from "$lib/components/ui/label/index.js";
 import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
 
 let { open = $bindable(false) }: { open?: boolean } = $props();
 const isDesktop = new MediaQuery("(min-width: 768px)");
 
 const id = $props.id();
</script>
 
{#if isDesktop.current}
 <Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
   <Dialog.Header>
    <Dialog.Title>Edit profile</Dialog.Title>
    <Dialog.Description>
     Make changes to your profile here. Click save when you're done.
    </Dialog.Description>
   </Dialog.Header>
   <form class="grid items-start gap-4">
    <div class="grid gap-2">
     <Label for="email-{id}">Email</Label>
     <Input type="email" id="email-{id}" value="shadcn@example.com" />
    </div>
    <div class="grid gap-2">
     <Label for="username-{id}">Username</Label>
     <Input id="username-{id}" value="@shadcn" />
    </div>
    <Button type="submit">Save changes</Button>
   </form>
  </Dialog.Content>
 </Dialog.Root>
{:else}
 <Drawer.Root bind:open>
  <Drawer.Trigger class={buttonVariants({ variant: "outline" })}
   >Edit Profile</Drawer.Trigger
  >
  <Drawer.Content>
   <Drawer.Header class="text-start">
    <Drawer.Title>Edit profile</Drawer.Title>
    <Drawer.Description>
     Make changes to your profile here. Click save when you're done.
    </Drawer.Description>
   </Drawer.Header>
   <form class="grid items-start gap-4 px-4">
    <div class="grid gap-2">
     <Label for="email-{id}">Email</Label>
     <Input type="email" id="email-{id}" value="shadcn@example.com" />
    </div>
    <div class="grid gap-2">
     <Label for="username-{id}">Username</Label>
     <Input id="username-{id}" value="@shadcn" />
    </div>
    <Button type="submit">Save changes</Button>
   </form>
   <Drawer.Footer class="pt-2">
    <Drawer.Close class={buttonVariants({ variant: "outline" })}
     >Cancel</Drawer.Close
    >
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

	let { open = $bindable(false) }: { open?: boolean } = $props();
	const isDesktop = new MediaQuery("(min-width: 768px)");
	const id = $props.id();

	let title = $state("");
	let description = $state("");
	let scheduleAt = $state("");
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
			description: description.trim() === "" ? null : description,
			schedule_at: scheduleAt === "" ? null : new Date(scheduleAt).toISOString()
		};

		try {
			// TODO: appel API — POST /live-streams
			console.log(payload);
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
					{submitting ? "Création…" : "Créer le live"}
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
					{submitting ? "Création…" : "Créer le live"}
				</Button>
			</form>
			<Drawer.Footer class="pt-2">
				<Drawer.Close class={buttonVariants({ variant: "outline" })}>Annuler</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
{/if}