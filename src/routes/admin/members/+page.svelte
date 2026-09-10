<script lang="ts">
    import { toast } from "svelte-sonner";

    // ⚠️ Adapte le chemin d'import selon ton projet
    // import { getMembers } from "$lib/features/admin-member/api";

    import DataTableMember from "$lib/components/data-table-member.svelte";
    import type { Member } from "$lib/components/data-table-member.svelte";

    let members = $state<Member[]>([]);
    let isLoading = $state(true);

    async function loadMembers() {
        isLoading = true;
        try {
            const res = await getMembers();
            members = res.members ?? res.data ?? res;
        } catch (err) {
            toast.error("Impossible de charger les membres");
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        loadMembers();
    });
</script>

<DataTableMember data={members} />