<script lang="ts">
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CreateMenu from "$lib/components/create-menu.svelte";

import './layout.css';
import { ModeWatcher } from 'mode-watcher';
import { setUser, authState } from '$lib/features/auth/store';
	import type { LayoutData } from './$types';
	import type { Snippet } from "svelte";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	$effect(() => {
		setUser(data.user);
	});
</script>
<ModeWatcher defaultMode="dark" />
{#if $authState.isAuthenticated}
<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2 justify-between ">
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger class="-ms-1" />
        <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item class="hidden md:block">
              <Breadcrumb.Link href="##">Build Your Application</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="hidden md:block" />
            <Breadcrumb.Item>
              <Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
	  <div class="px-4">
<CreateMenu/>
	  </div>
	  
    </header>
    <!-- <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div class="grid auto-rows-min gap-4 md:grid-cols-3">
        <div class="bg-muted/50 aspect-video rounded-xl"></div>
        <div class="bg-muted/50 aspect-video rounded-xl"></div>
        <div class="bg-muted/50 aspect-video rounded-xl"></div>
      </div>
      <div class="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min"></div>
    </div> -->

	{@render children()}
  </Sidebar.Inset>
</Sidebar.Provider>
{:else}
	{@render children()}
{/if}