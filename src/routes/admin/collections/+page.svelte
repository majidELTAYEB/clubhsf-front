<script lang="ts">
    import { goto } from "$app/navigation";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Spinner } from "$lib/components/ui/spinner";
    import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
    import SettingsIcon from "@lucide/svelte/icons/settings";
    import LinkIcon from "@lucide/svelte/icons/link";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import SearchIcon from "@lucide/svelte/icons/search";
    import VideoIcon from "@lucide/svelte/icons/video";
    import FolderIcon from "@lucide/svelte/icons/folder";
    import { toast } from "svelte-sonner";

    // ⚠️ Adapte le chemin d'import selon ton projet ("../../api", "$lib/api", etc.)
    // import {
    //     getCollections,
    //     deleteCollection,
    //     updateCollection,
    //     createCollection,
    // } from "$lib/api";

    import { getCollections } from "$lib/features/new-video/api";
    import DataTableCollection from "$lib/components/data-table-collection.svelte";

    type Collection = {
        id: string;
        title: string;
        slug: string;
        description?: string;
        cover_image_url?: string;
        is_public: boolean;
        created_at: string;
        video_count?: number;
    };

    let collections = $state<Collection[]>([]);
    let isLoading = $state(true);
    let searchQuery = $state("");

    // Suppression
    let collectionToDelete = $state<Collection | null>(null);
    let isDeleting = $state(false);

    // Création rapide
    let isCreateDialogOpen = $state(false);
    let newTitle = $state("");
    let isCreating = $state(false);

    async function loadCollections() {
        isLoading = true;
        try {
            const res = await getCollections();
            collections = res.data ?? res;
        } catch (err) {
            toast.error("Impossible de charger les collections");
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        loadCollections();
    });

    const filteredCollections = $derived(
        collections.filter((c) =>
            c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
    );

    function formatDate(dateStr: string) {
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(dateStr));
    }

    async function handleTogglePublic(collection: Collection) {
        const previous = collection.is_public;

        // Optimistic update
        collections = collections.map((c) =>
            c.id === collection.id ? { ...c, is_public: !c.is_public } : c
        );

        // try {
        //     await updateCollection(collection.id, { is_public: !previous });
        //     toast.success(!previous ? "Formation publiée" : "Formation repassée en brouillon");
        // } catch (err) {
        //     collections = collections.map((c) =>
        //         c.id === collection.id ? { ...c, is_public: previous } : c
        //     );
        //     toast.error("Impossible de mettre à jour la visibilité");
        // }
    }

    function handleCopyLink(collection: Collection) {
        const url = `${window.location.origin}/collection/${collection.slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papiers");
    }

    function goToCollection(id: string) {
        goto(`/admin/collections/${id}`);
    }

    async function confirmDelete() {
        if (!collectionToDelete) return;
        isDeleting = true;
        try {
            // await deleteCollection(collectionToDelete.id);
            // collections = collections.filter((c) => c.id !== collectionToDelete!.id);
            // toast.success(`Collection "${collectionToDelete.title}" supprimée`);
            // collectionToDelete = null;
        } catch (err) {
            toast.error("Impossible de supprimer la collection");
        } finally {
            isDeleting = false;
        }
    }

    async function handleCreate() {
        const title = newTitle.trim();
        if (title === "") return;
        isCreating = true;
        try {
            // const newCollection = await createCollection({ title });
            // collections = [newCollection, ...collections];
            // isCreateDialogOpen = false;
            // newTitle = "";
            // toast.success(`Collection "${newCollection.title}" créée`);
            // goToCollection(newCollection.id);
        } catch (err) {
            toast.error("Impossible de créer la collection");
        } finally {
            isCreating = false;
        }
    }
</script>

<DataTableCollection data={collections} />