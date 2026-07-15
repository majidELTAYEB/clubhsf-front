<!-- <script lang="ts">
 import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
 import { Button } from "$lib/components/ui/button/index.js";
</script>
 
<DropdownMenu.Root>
 <DropdownMenu.Trigger>
  {#snippet child({ props })}
   <Button {...props} variant="outline">+ Créer</Button>
  {/snippet}
 </DropdownMenu.Trigger>
 <DropdownMenu.Content class="w-56" align="end">
  <DropdownMenu.Label>My Account</DropdownMenu.Label>
  <DropdownMenu.Group>
   <DropdownMenu.Item>
    Profile
    <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
   </DropdownMenu.Item>
   <DropdownMenu.Item>
    Billing
    <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
   </DropdownMenu.Item>
   <DropdownMenu.Item>
    Settings
    <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
   </DropdownMenu.Item>
   <DropdownMenu.Item>
    Keyboard shortcuts
    <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
   </DropdownMenu.Item>
  </DropdownMenu.Group>
  <DropdownMenu.Separator />
  <DropdownMenu.Group>
   <DropdownMenu.Item>Team</DropdownMenu.Item>
   <DropdownMenu.Sub>
    <DropdownMenu.SubTrigger>Invite users</DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent>
     <DropdownMenu.Item>Email</DropdownMenu.Item>
     <DropdownMenu.Item>Message</DropdownMenu.Item>
     <DropdownMenu.Separator />
     <DropdownMenu.Item>More...</DropdownMenu.Item>
    </DropdownMenu.SubContent>
   </DropdownMenu.Sub>
   <DropdownMenu.Item>
    New Team
    <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
   </DropdownMenu.Item>
  </DropdownMenu.Group>
  <DropdownMenu.Separator />
  <DropdownMenu.Item>GitHub</DropdownMenu.Item>
  <DropdownMenu.Item>Support</DropdownMenu.Item>
  <DropdownMenu.Item disabled>API</DropdownMenu.Item>
  <DropdownMenu.Separator />
  <DropdownMenu.Item>
   Log out
   <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
  </DropdownMenu.Item>
 </DropdownMenu.Content>
</DropdownMenu.Root> -->

<!-- <script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">+ Créer</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		<DropdownMenu.Item>Nouveau live</DropdownMenu.Item>
		<DropdownMenu.Item>Nouvelle VOD</DropdownMenu.Item>
		<DropdownMenu.Item>Nouvelle formation</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root> -->

<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	// import { LayoutGrid, FileText, Upload, Chrome } from "@lucide/svelte";

    import CreateLive from "../features/newLive/components/create-live.svelte";
	import LayoutGrid from "@lucide/svelte/icons/layout-grid";
	import FileText from "@lucide/svelte/icons/file-text";
	import Upload from "@lucide/svelte/icons/upload";
    import Plus from "@lucide/svelte/icons/plus";

    let createLiveOpen = $state(false);
    let dropdownOpen = $state(false);
    
</script>

<DropdownMenu.Root bind:open={dropdownOpen}>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} ><Plus/> Créer</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="flex w-80 flex-col gap-[3px] p-1" align="end">
		<DropdownMenu.Item onSelect={(e) => {
				e.preventDefault();
                dropdownOpen = false;
				setTimeout(() => (createLiveOpen = true), 0);
			}} class="border-border bg-background h-14.5 gap-4 rounded-2xl border px-4 py-3">
			<LayoutGrid class="size-5 shrink-0" />
			<div class="flex flex-col gap-0.5">
				<span class="text-sm font-medium">Nouveau live</span>
				<span class="text-muted-foreground text-xs">Démarrer une diffusion en direct</span>
			</div>
		</DropdownMenu.Item>

		<DropdownMenu.Item class="border-border bg-background h-14.5 gap-4 rounded-2xl border px-4 py-3">
			<FileText class="size-5 shrink-0" />
			<div class="flex flex-col gap-0.5">
				<span class="text-sm font-medium">Nouvelle VOD</span>
				<span class="text-muted-foreground text-xs">Ajouter une vidéo à la demande</span>
			</div>
		</DropdownMenu.Item>

		<DropdownMenu.Item class="border-border bg-background h-14.5 gap-4 rounded-2xl border px-4 py-3">
			<Upload class="size-5 shrink-0" />
			<div class="flex flex-col gap-0.5">
				<span class="text-sm font-medium">Nouvelle formation</span>
				<span class="text-muted-foreground text-xs">Créer un parcours de formation</span>
			</div>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<CreateLive bind:open={createLiveOpen} />