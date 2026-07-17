<script lang="ts">
  import type { PageData } from './$types';
  import SectionCards from "$lib/components/section-cards.svelte";
  import DataTable from "$lib/components/data-table.svelte";

  let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-1 flex-col">
  <div class="@container/main flex flex-1 flex-col gap-2">
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <!-- <SectionCards /> -->
      <DataTable data={data.lives} />
    </div>
  </div>
</div>