<script lang="ts" module>
    import type { ColumnDef } from "@tanstack/table-core";

    // 1. Définition du schéma correspondant aux données de collection
    export type Collection = {
        id: string;
        title: string;
        slug: string;
        description?: string;
        cover_image_url?: string;
        is_public: boolean;
        video_count?: number;
        created_at: string;
    };

    // 2. Définition des colonnes
    export const columns: ColumnDef<Collection>[] = [
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
            header: "Titre",
        },
        {
            accessorKey: "video_count",
            header: "Vidéos",
        },
        {
            accessorKey: "is_public",
            header: "Statut",
        },
        {
            accessorKey: "slug",
            header: "Slug",
        },
        {
            accessorKey: "created_at",
            header: "Créée le",
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
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Spinner } from "$lib/components/ui/spinner";

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
    import FolderIcon from "@tabler/icons-svelte/icons/folder";
    import SettingsIcon from "@tabler/icons-svelte/icons/settings";

    // Navigation
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";

    // Drag and Drop
    import { DragDropProvider } from "@dnd-kit-svelte/svelte";
    import { move } from "@dnd-kit/helpers";
    import { useSortable } from "@dnd-kit-svelte/svelte/sortable";
	import { updateCollection } from "$lib/features/admin-collection/api";
       import {
        createCollection,

    } from "../features/new-video/api";


    // ⚠️ Adapte le chemin d'import selon ton projet
    // import { deleteCollection, updateCollection, createCollection } from "$lib/api";

    // 3. Réception des données
    let { data }: { data: Collection[] } = $props();

    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([]);
    let rowSelection = $state<RowSelectionState>({});
    // Le slug est masqué par défaut mais reste accessible via "Personnaliser"
    let columnVisibility = $state<VisibilityState>({
        slug: false,
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

    // 4. Onglets, calculés dynamiquement à partir des données reçues
    let views = $derived([
        { id: "all", label: "Toutes les collections", badge: 0 },
        { id: "published", label: "Publiées", badge: data.filter((d) => d.is_public).length },
        { id: "draft", label: "Brouillons", badge: data.filter((d) => !d.is_public).length },
    ]);

    let view = $state("all");
    let viewLabel = $derived(views.find((v) => view === v.id)?.label ?? "Sélectionner une vue");

    // Création rapide
    let isCreateDialogOpen = $state(false);
    let newTitle = $state("");
    let isCreating = $state(false);

    // Suppression
    let collectionToDelete = $state<Collection | null>(null);
    let isDeleting = $state(false);

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    async function handleTogglePublic(collection: Collection) {
        const previous = collection.is_public;
        const index = data.findIndex((c) => c.id === collection.id);
        if (index === -1) return;

        data[index] = { ...data[index], is_public: !previous };

        try {
            await updateCollection(collection.id, { is_public: !previous });
            toast.success(!previous ? "Collection publiée" : "Collection repassée en brouillon");
        } catch (err) {
            data[index] = { ...data[index], is_public: previous };
            toast.error("Impossible de mettre à jour la visibilité");
        }
    }

    function handleCopyLink(collection: Collection) {
        const url = `${window.location.origin}/collection/${collection.slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papiers");
    }

    async function confirmDelete() {
        if (!collectionToDelete) return;
        isDeleting = true;
        // try {
        //     await deleteCollection(collectionToDelete.id);
        //     data = data.filter((c) => c.id !== collectionToDelete!.id);
        //     toast.success(`"${collectionToDelete.title}" supprimée`);
        //     collectionToDelete = null;
        // } catch (err) {
        //     toast.error("Impossible de supprimer la formation");
        // } finally {
        //     isDeleting = false;
        // }
    }

    async function handleCreate() {
        const title = newTitle.trim();
        if (title === "") return;
        isCreating = true;
        try {
            const newCollection = await createCollection({ title });
            data = [newCollection, ...data];
            isCreateDialogOpen = false;
            newTitle = "";
            toast.success(`"${newCollection.title}" créée`);
            goto(`/admin/collections/${newCollection.id}`);
        } catch (err) {
            toast.error("Impossible de créer la formation");
        } finally {
            isCreating = false;
        }
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
            <Button size="sm" onclick={() => (isCreateDialogOpen = true)}>
                <PlusIcon class="mr-2 h-4 w-4" />
                <span class="hidden lg:inline">Nouvelle collection</span>
                <span class="lg:hidden">Nouvelle</span>
            </Button>
        </div>
    </div>

    {#snippet dataTable(rows: Row<Collection>[])}
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
                                    Aucune collection trouvée.
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

    <Tabs.Content value="published" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {@render dataTable(table.getRowModel().rows.filter((r) => r.original.is_public))}
    </Tabs.Content>

    <Tabs.Content value="draft" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {@render dataTable(table.getRowModel().rows.filter((r) => !r.original.is_public))}
    </Tabs.Content>
</Tabs.Root>

{#snippet DraggableRow({ row }: { row: Row<Collection> })}
    {@const { ref, isDragging, handleRef } = useSortable({
        id: row.original.id,
        index: () => row.index,
    })}

    <Table.Row
        data-state={row.getIsSelected() && "selected"}
        data-dragging={isDragging.current}
        class="relative z-0 cursor-pointer data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        {@attach ref}
        onclick={() => goto(`/admin/collections/${row.original.id}`)}
    >
        {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell onclick={(e) => {
                if (['drag', 'select', 'actions'].includes(cell.column.id)) e.stopPropagation();
            }}>
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
                    <div class="flex items-center gap-3">
                        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
                            {#if row.original.cover_image_url}
                                <img src={row.original.cover_image_url} alt={row.original.title} class="size-full object-cover" />
                            {:else}
                                <FolderIcon class="size-4 text-muted-foreground" />
                            {/if}
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="font-medium text-foreground">{row.original.title}</span>
                            {#if row.original.description}
                                <span class="text-muted-foreground text-xs line-clamp-1 max-w-[300px]">
                                    {row.original.description}
                                </span>
                            {/if}
                        </div>
                    </div>
                {:else if cell.column.id === 'video_count'}
                    <span class="text-sm text-muted-foreground">
                        {row.original.video_count ?? 0}
                    </span>
                {:else if cell.column.id === 'is_public'}
                    {#if row.original.is_public}
                        <Badge variant="default">Publiée</Badge>
                    {:else}
                        <Badge variant="secondary" class="text-muted-foreground">Brouillon</Badge>
                    {/if}
                {:else if cell.column.id === 'slug'}
                    <code class="text-xs text-muted-foreground">{row.original.slug}</code>
                {:else if cell.column.id === 'created_at'}
                    <span class="text-sm text-muted-foreground">
                        {formatDate(row.original.created_at)}
                    </span>
                {:else if cell.column.id === 'actions'}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            {#snippet child({ props })}
                                <Button variant="ghost" size="icon" {...props}>
                                    <DotsIcon class="h-4 w-4" />
                                    <span class="sr-only">Ouvrir le menu</span>
                                </Button>
                            {/snippet}
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" class="w-40">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item onclick={() => goto(`/admin/collections/${row.original.id}`)}>
                                <SettingsIcon class="mr-2 h-3.5 w-3.5" />
                                Gérer
                            </DropdownMenu.Item>
                            <!-- <DropdownMenu.Item onclick={() => handleTogglePublic(row.original)}>
                                {row.original.is_public ? "Repasser en brouillon" : "Publier"}
                            </DropdownMenu.Item> -->
                            <DropdownMenu.Item onclick={() => handleCopyLink(row.original)}>
                                <CopyIcon class="mr-2 h-3.5 w-3.5" />
                                Copier le lien
                            </DropdownMenu.Item>

                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
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

<!-- Dialog création rapide -->
<AlertDialog.Root bind:open={isCreateDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Nouvelle collection</AlertDialog.Title>
            <AlertDialog.Description>
                Donne un titre à ta collection, tu pourras ajouter les vidéos et lives ensuite.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <Input
            bind:value={newTitle}
            placeholder="Collection débutant 2026"
            onkeydown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                }
            }}
        />
        <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={isCreating}>Annuler</AlertDialog.Cancel>
            <Button onclick={handleCreate} disabled={newTitle.trim() === "" || isCreating}>
                {#if isCreating}
                    <Spinner class="size-4 mr-2" /> Création...
                {:else}
                    Créer
                {/if}
            </Button>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<!-- Confirmation suppression -->
<AlertDialog.Root open={collectionToDelete !== null}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Supprimer "{collectionToDelete?.title}" ?</AlertDialog.Title>
            <AlertDialog.Description>
                Cette action est irréversible. La collection sera supprimée, mais les vidéos
                qu'elle contient resteront disponibles ailleurs.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={isDeleting} onclick={() => (collectionToDelete = null)}>
                Annuler
            </AlertDialog.Cancel>
            <AlertDialog.Action
                onclick={confirmDelete}
                disabled={isDeleting}
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
                {#if isDeleting}
                    <Spinner class="size-4 mr-2" /> Suppression...
                {:else}
                    Supprimer
                {/if}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>