<script lang="ts">
    import type { Member } from "$lib/components/data-table-members.svelte";
    import { toast } from "svelte-sonner";

    import DataTableMember from "$lib/components/data-table-members.svelte";
    import { getMembers } from "$lib/features/admin-members/api";


    let members = $state<Member[]>([]);
    let total = $state(0);
    let limit = $state(10);
    let offset = $state(0);
    let isLoading = $state(true);

    async function loadMembers() {
        isLoading = true;
        try {
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(offset),
            });

            const body = await getMembers(params);

            members = body.members ?? [];
            total = body.total ?? 0;
            // Le backend peut renvoyer limit/offset "canoniques" (ex: valeurs
            // par défaut si absentes de la requête) : on les resynchronise.
            limit = body.limit || limit;
            offset = body.offset ?? offset;
        } catch (err) {
            toast.error("Impossible de charger les membres");
        } finally {
            isLoading = false;
        }
    }

    function handlePaginationChange(newLimit: number, newOffset: number) {
        limit = newLimit;
        offset = newOffset;
        loadMembers();
    }

    $effect(() => {
        loadMembers();
    });
</script>

<DataTableMember
    data={members}
    {total}
    {limit}
    {offset}
    {isLoading}
    onPaginationChange={handlePaginationChange}
/>