<script lang="ts" module>
    import type { ColumnDef } from "@tanstack/table-core";

    // 1. Définition du schéma correspondant aux données de membre
    export type Subscription = {
        stripe_customer_id: string;
        status: "active" | "canceled" | "past_due" | "trialing" | string;
        current_period_start: string;
        current_period_end: string;
        cancel_at_period_end: boolean;
        canceled_at: string | null;
        ended_at: string | null;
    };

    export type Member = {
        id: string;
        email: string;
        full_name?: string;
        role: "user" | "admin" | string;
        created_at: string;
        subscription: Subscription | null;
    };

    // 2. Définition des colonnes
    export const columns: ColumnDef<Member>[] = [
        {
            id: "select",
            header: () => "Sélection",
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "email",
            header: "Membre",
        },
        {
            accessorKey: "role",
            header: "Rôle",
        },
        {
            id: "subscription_status",
            header: "Abonnement",
        },
        {
            id: "subscription_period_end",
            header: "Fin de période",
        },
        {
            accessorKey: "created_at",
            header: "Créé le",
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
        getSortedRowModel,
        type ColumnFiltersState,
        type PaginationState,
        type Row,
        type RowSelectionState,
        type SortingState,
        type VisibilityState,
    } from "@tanstack/table-core";
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
    import { Spinner } from "$lib/components/ui/spinner";

    // Icons
    import LayoutColumnsIcon from "@tabler/icons-svelte/icons/layout-columns";
    import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
    import ChevronsLeftIcon from "@tabler/icons-svelte/icons/chevrons-left";
    import ChevronLeftIcon from "@tabler/icons-svelte/icons/chevron-left";
    import ChevronRightIcon from "@tabler/icons-svelte/icons/chevron-right";
    import ChevronsRightIcon from "@tabler/icons-svelte/icons/chevrons-right";
    import DotsIcon from "@tabler/icons-svelte/icons/dots";
    import CopyIcon from "@tabler/icons-svelte/icons/copy";
    import SettingsIcon from "@tabler/icons-svelte/icons/settings";
    import ExternalLinkIcon from "@tabler/icons-svelte/icons/external-link";

    // Navigation
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";

    // ⚠️ Adapte le chemin d'import selon ton projet
    // import { updateMember } from "$lib/features/admin-member/api";

    // 3. Réception des données
    // La pagination est gérée côté serveur (limit/offset) : ce composant reçoit
    // uniquement LA page courante + les métadonnées, et notifie le parent des
    // changements via onPaginationChange.
    let {
        data,
        total = 0,
        limit = 10,
        offset = 0,
        isLoading = false,
        hasSubscription = false,
        onPaginationChange,
        onFilterChange,
    }: {
        data: Member[];
        total?: number;
        limit?: number;
        offset?: number;
        isLoading?: boolean;
        hasSubscription?: boolean;
        onPaginationChange?: (limit: number, offset: number) => void;
        onFilterChange?: (hasSubscription: boolean) => void;
    } = $props();

    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([]);
    let rowSelection = $state<RowSelectionState>({});
    let columnVisibility = $state<VisibilityState>({});

    // Dérivés de limit/offset fournis par le parent (source de vérité = l'URL/l'API)
    let pageIndex = $derived(limit > 0 ? Math.floor(offset / limit) : 0);
    let pageCount = $derived(Math.max(1, Math.ceil(total / Math.max(limit, 1))));

    function emitPagination(next: PaginationState) {
        onPaginationChange?.(next.pageSize, next.pageIndex * next.pageSize);
    }

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        state: {
            get pagination() { return { pageIndex, pageSize: limit }; },
            get sorting() { return sorting; },
            get columnVisibility() { return columnVisibility; },
            get rowSelection() { return rowSelection; },
            get columnFilters() { return columnFilters; },
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        manualPagination: true,
        get pageCount() { return pageCount; },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: (updater) => {
            const current = { pageIndex, pageSize: limit };
            const next = typeof updater === "function" ? updater(current) : updater;
            emitPagination(next);
        },
        onSortingChange: (updater) => { sorting = typeof updater === "function" ? updater(sorting) : updater; },
        onColumnFiltersChange: (updater) => { columnFilters = typeof updater === "function" ? updater(columnFilters) : updater; },
        onColumnVisibilityChange: (updater) => { columnVisibility = typeof updater === "function" ? updater(columnVisibility) : updater; },
        onRowSelectionChange: (updater) => { rowSelection = typeof updater === "function" ? updater(rowSelection) : updater; },
    });

    function formatDate(dateStr?: string | null) {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function initials(member: Member) {
        const source = member.full_name?.trim() || member.email;
        return source.slice(0, 2).toUpperCase();
    }

    function subscriptionBadgeVariant(status?: string) {
        switch (status) {
            case "active":
                return "default";
            case "trialing":
                return "secondary";
            default:
                return "secondary";
        }
    }

    function subscriptionLabel(member: Member) {
        if (!member.subscription) return "Aucun";
        switch (member.subscription.status) {
            case "active":
                return member.subscription.cancel_at_period_end ? "Actif (résiliation prévue)" : "Actif";
            case "canceled":
                return "Résilié";
            case "past_due":
                return "Impayé";
            case "trialing":
                return "Essai";
            default:
                return member.subscription.status;
        }
    }

    function handleCopyEmail(member: Member) {
        navigator.clipboard.writeText(member.email);
        toast.success("Email copié dans le presse-papiers");
    }

    function handleCopyStripeId(member: Member) {
        if (!member.subscription?.stripe_customer_id) return;
        navigator.clipboard.writeText(member.subscription.stripe_customer_id);
        toast.success("Identifiant client Stripe copié");
    }

    function openStripeCustomer(member: Member) {
        if (!member.subscription?.stripe_customer_id) return;
        window.open(
            `https://dashboard.stripe.com/customers/${member.subscription.stripe_customer_id}`,
            "_blank"
        );
    }

    function goToMember(member: Member) {
        goto(`/admin/members/${member.id}`);
    }
</script>

<div class="w-full flex flex-col justify-start gap-6 py-4">
    <div class="flex items-center justify-between px-4 lg:px-6">
        <div>
            <h2 class="text-lg font-semibold">Membres</h2>
            <p class="text-muted-foreground text-sm">
                {total} membre{total > 1 ? "s" : ""} au total
            </p>
        </div>

        <div class="flex items-center gap-2">
            <Tabs.Root
                value={hasSubscription ? "with-subscription" : "all"}
                onValueChange={(v) => onFilterChange?.(v === "with-subscription")}
            >
                <Tabs.List>
                    <Tabs.Trigger value="all">Tous</Tabs.Trigger>
                    <Tabs.Trigger value="with-subscription">Avec abonnement</Tabs.Trigger>
                </Tabs.List>
            </Tabs.Root>

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
                            {column.columnDef.header}
                        </DropdownMenu.CheckboxItem>
                    {/each}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </div>

    <div class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div class="overflow-hidden rounded-lg border">
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
                    {#if isLoading}
                        <Table.Row>
                            <Table.Cell colspan={columns.length} class="h-24 text-center">
                                <div class="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Spinner class="size-4" /> Chargement...
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    {:else if table.getRowModel().rows.length}
                        {#each table.getRowModel().rows as row (row.id)}
                            {@render MemberRow({ row })}
                        {/each}
                    {:else}
                        <Table.Row>
                            <Table.Cell colspan={columns.length} class="h-24 text-center">
                                Aucun membre trouvé.
                            </Table.Cell>
                        </Table.Row>
                    {/if}
                </Table.Body>
            </Table.Root>
        </div>

        <!-- Pagination serveur (limit/offset) -->
        <div class="flex items-center justify-between px-4">
            <div class="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} sur
                {data.length} ligne(s) sélectionnée(s) sur cette page.
            </div>
            <div class="flex w-full items-center gap-8 lg:w-fit">
                <div class="hidden items-center gap-2 lg:flex">
                    <Label for="rows-per-page" class="text-sm font-medium">Lignes par page</Label>
                    <Select.Root
                        type="single"
                        value={`${limit}`}
                        onValueChange={(v) => onPaginationChange?.(Number(v), 0)}
                    >
                        <Select.Trigger size="sm" class="w-20" id="rows-per-page">
                            {limit}
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
                    Page {pageIndex + 1} sur {pageCount}
                </div>
                <div class="ms-auto flex items-center gap-2 lg:ms-0">
                    <Button
                        variant="outline"
                        class="hidden h-8 w-8 p-0 lg:flex"
                        onclick={() => onPaginationChange?.(limit, 0)}
                        disabled={pageIndex === 0}
                    >
                        <span class="sr-only">Première page</span>
                        <ChevronsLeftIcon class="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        class="size-8"
                        size="icon"
                        onclick={() => onPaginationChange?.(limit, Math.max(0, offset - limit))}
                        disabled={pageIndex === 0}
                    >
                        <span class="sr-only">Page précédente</span>
                        <ChevronLeftIcon class="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        class="size-8"
                        size="icon"
                        onclick={() => onPaginationChange?.(limit, offset + limit)}
                        disabled={pageIndex + 1 >= pageCount}
                    >
                        <span class="sr-only">Page suivante</span>
                        <ChevronRightIcon class="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        class="hidden size-8 lg:flex"
                        size="icon"
                        onclick={() => onPaginationChange?.(limit, (pageCount - 1) * limit)}
                        disabled={pageIndex + 1 >= pageCount}
                    >
                        <span class="sr-only">Dernière page</span>
                        <ChevronsRightIcon class="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</div>

{#snippet MemberRow({ row }: { row: Row<Member> })}
    <Table.Row
        data-state={row.getIsSelected() && "selected"}
        class="cursor-pointer"
    >
        {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell onclick={(e) => {
                if (['select', 'actions'].includes(cell.column.id)) e.stopPropagation();
            }}>
                {#if cell.column.id === 'select'}
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(!!v)}
                        aria-label="Sélectionner la ligne"
                    />
                {:else if cell.column.id === 'email'}
                    <div class="flex items-center gap-3">
                        <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {initials(row.original)}
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="font-medium text-foreground">
                                {row.original.full_name || row.original.email}
                            </span>
                            {#if row.original.full_name}
                                <span class="text-muted-foreground text-xs">{row.original.email}</span>
                            {/if}
                        </div>
                    </div>
                {:else if cell.column.id === 'role'}
                    {#if row.original.role === 'admin'}
                        <Badge variant="default">Admin</Badge>
                    {:else}
                        <Badge variant="secondary" class="text-muted-foreground">Membre</Badge>
                    {/if}
                {:else if cell.column.id === 'subscription_status'}
                    <Badge variant={subscriptionBadgeVariant(row.original.subscription?.status)}>
                        {subscriptionLabel(row.original)}
                    </Badge>
                {:else if cell.column.id === 'subscription_period_end'}
                    <span class="text-sm text-muted-foreground">
                        {formatDate(row.original.subscription?.current_period_end)}
                    </span>
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
                        <DropdownMenu.Content align="end" class="w-52">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item >
                                <SettingsIcon class="mr-2 h-3.5 w-3.5" />
                                Voir le profil
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => handleCopyEmail(row.original)}>
                                <CopyIcon class="mr-2 h-3.5 w-3.5" />
                                Copier l'email
                            </DropdownMenu.Item>
                            {#if row.original.subscription}
                                <DropdownMenu.Item onclick={() => handleCopyStripeId(row.original)}>
                                    <CopyIcon class="mr-2 h-3.5 w-3.5" />
                                    Copier l'ID Stripe
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onclick={() => openStripeCustomer(row.original)}>
                                    <ExternalLinkIcon class="mr-2 h-3.5 w-3.5" />
                                    Voir sur Stripe
                                </DropdownMenu.Item>
                            {/if}
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