<!-- <script lang="ts" module>
	export const columns: ColumnDef<Schema>[] = [
		{
			id: "drag",
			header: () => null,
			cell: () => renderComponent(DataTableDragHandle, {}),
		},
		{
			accessorKey: "title",
			header: "Titre",
			cell: ({ row }) => renderComponent(DataTableCellViewer, { item: row }),
			enableHiding: false,
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => renderComponent(DataTableStatus, { row }),
		},
		{
			accessorKey: "schedule_at",
			header: () => renderComponent(DataTableHeaderTarget, {}),
			cell: ({ row }) => renderComponent(DataTableTarget, { row }),
		},
		{
			id: "actions",
			cell: () => renderComponent(DataTableActions, {}),
		},
	];
</script>

<script lang="ts">
	import {
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
	} from "@tanstack/table-core";
	import type { Schema } from "./schemas.js";
	import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
	import { createSvelteTable } from "$lib/components/ui/data-table/data-table.svelte.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { FlexRender, renderComponent } from "$lib/components/ui/data-table/index.js";
	import LayoutColumnsIcon from "@tabler/icons-svelte/icons/layout-columns";
	import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
	import PlusIcon from "@tabler/icons-svelte/icons/plus";
	import ChevronsLeftIcon from "@tabler/icons-svelte/icons/chevrons-left";
	import ChevronLeftIcon from "@tabler/icons-svelte/icons/chevron-left";
	import ChevronRightIcon from "@tabler/icons-svelte/icons/chevron-right";
	import ChevronsRightIcon from "@tabler/icons-svelte/icons/chevrons-right";
	import DataTableCheckbox from "./data-table-checkbox.svelte";
	import DataTableCellViewer from "./data-table-cell-viewer.svelte";
	import DataTableReviewer from "./data-table-reviewer.svelte";
	import DataTableActions from "./data-table-actions.svelte";
	import DataTableDragHandle from "./data-table-drag-handle.svelte";
	import DataTableType from "./data-table-type.svelte";
	import DataTableStatus from "./data-table-status.svelte";
	import DataTableTarget from "./data-table-target.svelte";
	import DataTableLimit from "./data-table-limit.svelte";
	import DataTableHeaderTarget from "./data-table-header-target.svelte";
	import DataTableHeaderLimit from "./data-table-header-limit.svelte";
	import { DragDropProvider } from "@dnd-kit-svelte/svelte";
	import { move } from "@dnd-kit/helpers";
	import { useSortable } from "@dnd-kit-svelte/svelte/sortable";
	import { Badge } from "$lib/components/ui/badge/index.js";

	let { data }: { data: Schema[] } = $props();
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			},
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		autoResetPageIndex: false,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === "function") {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === "function") {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === "function") {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === "function") {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
	});

	let views = [
		{
			id: "outline",
			label: "Outline",
			badge: 0,
		},
		{
			id: "past-performance",
			label: "Past Performance",
			badge: 3,
		},
		{
			id: "key-personnel",
			label: "Key Personnel",
			badge: 2,
		},
		{
			id: "focus-documents",
			label: "Focus Documents",
			badge: 0,
		},
	];

	let view = $state("outline");
	let viewLabel = $derived(views.find((v) => view === v.id)?.label ?? "Select a view");
</script>

<Tabs.Root value="outline" class="w-full flex-col justify-start gap-6">
	<div class="flex items-center justify-between px-4 lg:px-6">
		<Label for="view-selector" class="sr-only">View</Label>
		<Select.Root type="single" bind:value={view}>
			<Select.Trigger class="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
				{viewLabel}
			</Select.Trigger>
			<Select.Content>
				{#each views as view (view.id)}
					<Select.Item value={view.id}>{view.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Tabs.List
			class="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
		>
			{#each views as view (view.id)}
				<Tabs.Trigger value={view.id}>
					{view.label}
					{#if view.badge > 0}
						<Badge variant="secondary">{view.badge}</Badge>
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
		<div class="flex items-center gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="outline" size="sm" {...props}>
							<LayoutColumnsIcon />
							<span class="hidden lg:inline">Customize Columns</span>
							<span class="lg:hidden">Columns</span>
							<ChevronDownIcon />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-56">
					{#each table
						.getAllColumns()
						.filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()) as column (column.id)}
						<DropdownMenu.CheckboxItem
							class="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{column.id}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Button variant="outline" size="sm">
				<PlusIcon />
				<span class="hidden lg:inline">Add Section</span>
			</Button>
		</div>
	</div>
	<Tabs.Content value="outline" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
		<div class="overflow-hidden rounded-lg border">
			<DragDropProvider
				modifiers={[
					// @ts-expect-error @dnd-kit/abstract types are botched atm
					RestrictToVerticalAxis,
				]}
				onDragEnd={(e) => (data = move(data, e))}
			>
				<Table.Root>
					<Table.Header class="bg-muted sticky top-0 z-10">
						{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row>
								{#each headerGroup.headers as header (header.id)}
									<Table.Head colspan={header.colSpan}>
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body class="**:data-[slot=table-cell]:first:w-8">
						{#if table.getRowModel().rows?.length}
							{#each table.getRowModel().rows as row (row.id)}
								{@render DraggableRow({ row })}
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell colspan={columns.length} class="h-24 text-center">
									No results.
								</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</DragDropProvider>
		</div>
		<div class="flex items-center justify-between px-4">
			<div class="text-muted-foreground hidden flex-1 text-sm lg:flex">
				{table.getFilteredSelectedRowModel().rows.length} of
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>
			<div class="flex w-full items-center gap-8 lg:w-fit">
				<div class="hidden items-center gap-2 lg:flex">
					<Label for="rows-per-page" class="text-sm font-medium">Rows per page</Label>
					<Select.Root
						type="single"
						bind:value={
							() => `${table.getState().pagination.pageSize}`,
							(v) => table.setPageSize(Number(v))
						}
					>
						<Select.Trigger size="sm" class="w-20" id="rows-per-page">
							{table.getState().pagination.pageSize}
						</Select.Trigger>
						<Select.Content side="top">
							{#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
								<Select.Item value={pageSize.toString()}>
									{pageSize}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex w-fit items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of
					{table.getPageCount()}
				</div>
				<div class="ms-auto flex items-center gap-2 lg:ms-0">
					<Button
						variant="outline"
						class="hidden h-8 w-8 p-0 lg:flex"
						onclick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span class="sr-only">Go to first page</span>
						<ChevronsLeftIcon />
					</Button>
					<Button
						variant="outline"
						class="size-8"
						size="icon"
						onclick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span class="sr-only">Go to previous page</span>
						<ChevronLeftIcon />
					</Button>
					<Button
						variant="outline"
						class="size-8"
						size="icon"
						onclick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span class="sr-only">Go to next page</span>
						<ChevronRightIcon />
					</Button>
					<Button
						variant="outline"
						class="hidden size-8 lg:flex"
						size="icon"
						onclick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span class="sr-only">Go to last page</span>
						<ChevronsRightIcon />
					</Button>
				</div>
			</div>
		</div>
	</Tabs.Content>
	<Tabs.Content value="past-performance" class="flex flex-col px-4 lg:px-6">
		<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
	</Tabs.Content>
	<Tabs.Content value="key-personnel" class="flex flex-col px-4 lg:px-6">
		<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
	</Tabs.Content>
	<Tabs.Content value="focus-documents" class="flex flex-col px-4 lg:px-6">
		<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
	</Tabs.Content>
</Tabs.Root>

{#snippet DraggableRow({ row }: { row: Row<Schema> })}
	{@const { ref, isDragging, handleRef } = useSortable({
		id: row.original.id,
		index: () => row.index,
	})}

	<Table.Row
		data-state={row.getIsSelected() && "selected"}
		data-dragging={isDragging.current}
		class="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
		{@attach ref}
	>
		{#each row.getVisibleCells() as cell (cell.id)}
			<Table.Cell>
				<FlexRender
					attach={handleRef}
					content={cell.column.columnDef.cell}
					context={cell.getContext()}
				/>
			</Table.Cell>
		{/each}
	</Table.Row>
{/snippet} -->


<script lang="ts" module>
    import type { ColumnDef } from "@tanstack/table-core";

    // 1. Définition du schéma correspondant à ton JSON
    export type LiveStream = {
        id: string;
        title: string;
        description?: string;
        schedule_at: string;
        status: string;
        stream_key: string;
        rtmp_url: string;
        playback_id: string;
    };

    // 2. Définition des colonnes (toutes les données du schéma sont désormais représentées)
    export const columns: ColumnDef<LiveStream>[] = [
        {
            id: "drag",
            header: () => "",
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "select",
            header: () => "Sélection",
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: "Événement",
        },
        {
            accessorKey: "schedule_at",
            header: "Date de programmation",
        },
        {
            accessorKey: "status",
            header: "Statut",
        },
        {
            accessorKey: "playback_id",
            header: "Playback ID",
        },
        {
            accessorKey: "rtmp_url",
            header: "URL RTMP",
        },
        {
            id: "actions",
            header: "",
            enableHiding: false,
        },
    ];
</script>

<script lang="ts">
    import {
        getCoreRowModel,
        getFacetedRowModel,
        getFacetedUniqueValues,
        getFilteredRowModel,
        getPaginationRowModel,
        getSortedRowModel,
        type ColumnFiltersState,
        type PaginationState,
        type Row,
        type RowSelectionState,
        type SortingState,
        type VisibilityState,
    } from "@tanstack/table-core";
    import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
    import { createSvelteTable } from "$lib/components/ui/data-table/data-table.svelte.js";
    import { FlexRender } from "$lib/components/ui/data-table/index.js";

    // UI Components
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";

    // Icons
    import LayoutColumnsIcon from "@tabler/icons-svelte/icons/layout-columns";
    import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
    import PlusIcon from "@tabler/icons-svelte/icons/plus";
    import ChevronsLeftIcon from "@tabler/icons-svelte/icons/chevrons-left";
    import ChevronLeftIcon from "@tabler/icons-svelte/icons/chevron-left";
    import ChevronRightIcon from "@tabler/icons-svelte/icons/chevron-right";
    import ChevronsRightIcon from "@tabler/icons-svelte/icons/chevrons-right";
    import GripVerticalIcon from "@tabler/icons-svelte/icons/grip-vertical";
    import DotsIcon from "@tabler/icons-svelte/icons/dots";
    import CopyIcon from "@tabler/icons-svelte/icons/copy";

    // Navigation
    import { goto } from "$app/navigation";

    // Drag and Drop
    import { DragDropProvider } from "@dnd-kit-svelte/svelte";
    import { move } from "@dnd-kit/helpers";
    import { useSortable } from "@dnd-kit-svelte/svelte/sortable";

    // 3. Réception des données
    let { data }: { data: LiveStream[] } = $props();

    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([]);
    let rowSelection = $state<RowSelectionState>({});
    // Les colonnes techniques (playback_id / rtmp_url) sont masquées par défaut
    // mais restent accessibles via le menu "Personnaliser"
    let columnVisibility = $state<VisibilityState>({
        playback_id: false,
        rtmp_url: false,
    });

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        state: {
            get pagination() { return pagination; },
            get sorting() { return sorting; },
            get columnVisibility() { return columnVisibility; },
            get rowSelection() { return rowSelection; },
            get columnFilters() { return columnFilters; },
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        autoResetPageIndex: false,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: (updater) => { pagination = typeof updater === "function" ? updater(pagination) : updater; },
        onSortingChange: (updater) => { sorting = typeof updater === "function" ? updater(sorting) : updater; },
        onColumnFiltersChange: (updater) => { columnFilters = typeof updater === "function" ? updater(columnFilters) : updater; },
        onColumnVisibilityChange: (updater) => { columnVisibility = typeof updater === "function" ? updater(columnVisibility) : updater; },
        onRowSelectionChange: (updater) => { rowSelection = typeof updater === "function" ? updater(rowSelection) : updater; },
    });

    // 4. Onglets du dashboard, calculés dynamiquement à partir des données reçues
    let views = $derived([
        { id: "all", label: "Tous les lives", badge: 0 },
        { id: "scheduled", label: "À venir", badge: data.filter((d) => d.status === "scheduled").length },
        { id: "ended", label: "Terminés", badge: data.filter((d) => d.status === "ended").length },
    ]);

    let view = $state("all");
    let viewLabel = $derived(views.find((v) => view === v.id)?.label ?? "Sélectionner une vue");

    function truncateMiddle(value: string, keep = 8) {
        if (!value) return "";
        if (value.length <= keep * 2 + 3) return value;
        return `${value.slice(0, keep)}...${value.slice(-keep)}`;
    }
</script>

<Tabs.Root value="all" class="w-full flex-col justify-start gap-6">
    <div class="flex items-center justify-between px-4 lg:px-6">
        <Label for="view-selector" class="sr-only">Vue</Label>
        <Select.Root type="single" bind:value={view}>
            <Select.Trigger class="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
                {viewLabel}
            </Select.Trigger>
            <Select.Content>
                {#each views as view (view.id)}
                    <Select.Item value={view.id}>{view.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Tabs.List class="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            {#each views as view (view.id)}
                <Tabs.Trigger value={view.id}>
                    {view.label}
                    {#if view.badge > 0}
                        <Badge variant="secondary" class="ml-2">{view.badge}</Badge>
                    {/if}
                </Tabs.Trigger>
            {/each}
        </Tabs.List>

        <div class="flex items-center gap-2">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                        <Button variant="outline" size="sm" {...props}>
                            <LayoutColumnsIcon class="mr-2 h-4 w-4" />
                            <span class="hidden lg:inline">Personnaliser</span>
                            <span class="lg:hidden">Colonnes</span>
                            <ChevronDownIcon class="ml-2 h-4 w-4" />
                        </Button>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" class="w-56">
                    {#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
                        <DropdownMenu.CheckboxItem
                            class="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                            {column.id}
                        </DropdownMenu.CheckboxItem>
                    {/each}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>

    {#snippet dataTable(rows: Row<LiveStream>[])}
        <div class="overflow-hidden rounded-lg border">
            <DragDropProvider
                modifiers={[RestrictToVerticalAxis]}
                onDragEnd={(e) => (data = move(data, e))}
            >
                <Table.Root>
                    <Table.Header class="bg-muted sticky top-0 z-10">
                        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                            <Table.Row>
                                {#each headerGroup.headers as header (header.id)}
                                    <Table.Head colspan={header.colSpan}>
                                        {#if !header.isPlaceholder}
                                            {#if header.column.id === 'select'}
                                                <Checkbox
                                                    checked={table.getIsAllPageRowsSelected()}
                                                    indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
                                                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                                                    aria-label="Sélectionner tout"
                                                />
                                            {:else}
                                                <FlexRender
                                                    content={header.column.columnDef.header}
                                                    context={header.getContext()}
                                                />
                                            {/if}
                                        {/if}
                                    </Table.Head>
                                {/each}
                            </Table.Row>
                        {/each}
                    </Table.Header>
                    <Table.Body class="**:data-[slot=table-cell]:first:w-8">
                        {#if rows.length}
                            {#each rows as row (row.id)}
                                {@render DraggableRow({ row })}
                            {/each}
                        {:else}
                            <Table.Row>
                                <Table.Cell colspan={columns.length} class="h-24 text-center">
                                    Aucun live trouvé.
                                </Table.Cell>
                            </Table.Row>
                        {/if}
                    </Table.Body>
                </Table.Root>
            </DragDropProvider>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4">
            <div class="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} sur
                {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
            </div>
            <div class="flex w-full items-center gap-8 lg:w-fit">
                <div class="hidden items-center gap-2 lg:flex">
                    <Label for="rows-per-page" class="text-sm font-medium">Lignes par page</Label>
                    <Select.Root
                        type="single"
                        bind:value={
                            () => `${table.getState().pagination.pageSize}`,
                            (v) => table.setPageSize(Number(v))
                        }
                    >
                        <Select.Trigger size="sm" class="w-20" id="rows-per-page">
                            {table.getState().pagination.pageSize}
                        </Select.Trigger>
                        <Select.Content side="top">
                            {#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
                                <Select.Item value={pageSize.toString()}>
                                    {pageSize}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>
                <div class="flex w-fit items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                </div>
                <div class="ms-auto flex items-center gap-2 lg:ms-0">
                    <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex" onclick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <span class="sr-only">Première page</span>
                        <ChevronsLeftIcon class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" class="size-8" size="icon" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <span class="sr-only">Page précédente</span>
                        <ChevronLeftIcon class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" class="size-8" size="icon" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <span class="sr-only">Page suivante</span>
                        <ChevronRightIcon class="h-4 w-4" />
                    </Button>
                    <Button variant="outline" class="hidden size-8 lg:flex" size="icon" onclick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        <span class="sr-only">Dernière page</span>
                        <ChevronsRightIcon class="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    {/snippet}

    <Tabs.Content value="all" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {@render dataTable(table.getRowModel().rows)}
    </Tabs.Content>

    <Tabs.Content value="scheduled" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {@render dataTable(table.getRowModel().rows.filter((r) => r.original.status === "scheduled"))}
    </Tabs.Content>

    <Tabs.Content value="ended" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {@render dataTable(table.getRowModel().rows.filter((r) => r.original.status === "ended"))}
    </Tabs.Content>
</Tabs.Root>

{#snippet DraggableRow({ row }: { row: Row<LiveStream> })}
    {@const { ref, isDragging, handleRef } = useSortable({
        id: row.original.id,
        index: () => row.index,
    })}

    <Table.Row
        data-state={row.getIsSelected() && "selected"}
        data-dragging={isDragging.current}
        class="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        {@attach ref}
    >
        {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
                {#if cell.column.id === 'drag'}
                    <div {@attach handleRef} class="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVerticalIcon class="h-5 w-5" />
                    </div>
                {:else if cell.column.id === 'select'}
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(!!v)}
                        aria-label="Sélectionner la ligne"
                    />
                {:else if cell.column.id === 'title'}
                    <div class="flex flex-col gap-1">
                        <span class="font-medium text-foreground">{row.original.title}</span>
                        {#if row.original.description}
                            <span class="text-muted-foreground text-xs line-clamp-1 max-w-[300px]">
                                {row.original.description}
                            </span>
                        {/if}
                    </div>
                {:else if cell.column.id === 'schedule_at'}
                    <span class="text-sm text-muted-foreground">
                        {new Date(row.original.schedule_at).toLocaleString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                {:else if cell.column.id === 'status'}
                    {#if row.original.status === 'live'}
                        <Badge variant="destructive" class="animate-pulse">En direct</Badge>
                    {:else if row.original.status === 'scheduled'}
                        <Badge variant="outline">Programmé</Badge>
                    {:else if row.original.status === 'ended'}
                        <Badge variant="secondary" class="text-muted-foreground">Terminé</Badge>
                    {:else}
                        <Badge variant="default">{row.original.status}</Badge>
                    {/if}
                {:else if cell.column.id === 'playback_id'}
                    <div class="flex items-center gap-2">
                        <code class="text-xs text-muted-foreground">{truncateMiddle(row.original.playback_id)}</code>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-6 w-6"
                            onclick={() => navigator.clipboard.writeText(row.original.playback_id)}
                        >
                            <CopyIcon class="h-3.5 w-3.5" />
                            <span class="sr-only">Copier le playback ID</span>
                        </Button>
                    </div>
                {:else if cell.column.id === 'rtmp_url'}
                    <div class="flex items-center gap-2">
                        <code class="text-xs text-muted-foreground">{truncateMiddle(row.original.rtmp_url, 14)}</code>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-6 w-6"
                            onclick={() => navigator.clipboard.writeText(row.original.rtmp_url)}
                        >
                            <CopyIcon class="h-3.5 w-3.5" />
                            <span class="sr-only">Copier l'URL RTMP</span>
                        </Button>
                    </div>
                {:else if cell.column.id === 'actions'}
                    {#if row.original.status !== 'ended'}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                {#snippet child({ props })}
                                    <Button variant="ghost" size="icon" {...props}>
                                        <DotsIcon class="h-4 w-4" />
                                        <span class="sr-only">Ouvrir le menu</span>
                                    </Button>
                                {/snippet}
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content align="end">
                                <DropdownMenu.Label>Actions</DropdownMenu.Label>
                                <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(row.original.stream_key)}>
                                    Copier la clé de stream
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(row.original.rtmp_url)}>
                                    Copier l'URL RTMP
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(row.original.playback_id)}>
                                    Copier le Playback ID
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onclick={() => goto(`/admin/live/${row.original.id}`)}>
                                    Voir le live
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    {/if}
                {:else}
                    <FlexRender
                        content={cell.column.columnDef.cell}
                        context={cell.getContext()}
                    />
                {/if}
            </Table.Cell>
        {/each}
    </Table.Row>
{/snippet}