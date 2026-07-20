<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import PencilIcon from "@lucide/svelte/icons/pencil";
    import TrashIcon from "@lucide/svelte/icons/trash";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import ImageIcon from "@lucide/svelte/icons/image";
    import GlobeIcon from "@lucide/svelte/icons/globe";
    import LockIcon from "@lucide/svelte/icons/lock";
    import VideoOffIcon from "@lucide/svelte/icons/video-off";
    import { toast } from "svelte-sonner";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { Badge } from "$lib/components/ui/badge";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import * as Item from "$lib/components/ui/item/index.js";

    // ⚠️ Adapte le chemin d'import selon ton projet
    // import {
    //     getCollection,
    //     updateCollection,
    //     deleteCollection,
    //     getCollectionVideos,
    //     updateCollectionVideo,
    //     addVideoToCollection,
    //     getVideos,
    // } from "$lib/api";
    import { getCollection, getCollectionVideos, updateCollection, deleteCollection } from "$lib/features/admin-collection/api";
    // ⚠️ Adapte le chemin vers le composant de ton layout
	import CreateVideoDrawer from "$lib/features/admin-collection/components/create-video-drawer.svelte";

    type Collection = {
        id: string;
        title: string;
        slug: string;
        description?: string;
        cover_image_url?: string;
        is_public: boolean;
        created_at: string;
    };

    type CollectionVideo = {
        video_id: string;
        title: string;
        thumbnail_url?: string;
        position: number;
    };

    const collectionId = page.params.id;

    let collection = $state<Collection | null>(null);
    let isLoading = $state(true);

    // Formulaire d'édition
    let title = $state("");
    let description = $state("");
    let coverImageUrl = $state("");
    let coverError = $state(false);
    let isPublic = $state(true);
    let isSaving = $state(false);

    // Vidéos de la collection
    let videos = $state<CollectionVideo[]>([]);
    let isLoadingVideos = $state(true);

    // Ajout de vidéo (drawer partagé du layout : créer + uploader + rattacher)
    let isCreateVideoOpen = $state(false);
    let wasCreateVideoOpen = $state(false);

    $effect(() => {
        // Le drawer se ferme dès que l'upload démarre (la vidéo existe déjà
        // en base à ce moment-là) : on recharge la liste à sa fermeture.
        if (wasCreateVideoOpen && !isCreateVideoOpen) {
            loadVideos();
        }
        wasCreateVideoOpen = isCreateVideoOpen;
    });

    // Édition des infos d'une vidéo
    let isEditVideoDialogOpen = $state(false);
    let editingVideo = $state<CollectionVideo | null>(null);
    let editVideoTitle = $state("");
    let editVideoThumbnailUrl = $state("");
    let editVideoThumbnailError = $state(false);
    let isSavingVideoEdit = $state(false);

    // Suppression de la collection
    let isDeleteDialogOpen = $state(false);
    let isDeleting = $state(false);

    async function loadCollection() {
        isLoading = true;
        try {
            const result = await getCollection(collectionId);
            collection = result.data;
            title = collection.title;
            description = collection.description ?? "";
            coverImageUrl = collection.cover_image_url ?? "";
            isPublic = collection.is_public;
        } catch (err) {
            toast.error("Impossible de charger la collection");
        } finally {
            isLoading = false;
        }
    }

    async function loadVideos() {
        isLoadingVideos = true;
        try {
            // 🐛 corrigé : la fonction n'était ni appelée ni attendue,
            // et l'id de la collection n'était pas passé.
            const data = await getCollectionVideos(collectionId);
            videos = [...data.data].sort(
                (a: CollectionVideo, b: CollectionVideo) => a.position - b.position
            );
        } catch (err) {
            toast.error("Impossible de charger les vidéos de la collection");
        } finally {
            isLoadingVideos = false;
        }
    }

    $effect(() => {
        loadCollection();
        loadVideos();
    });

    const hasChanges = $derived(
        collection !== null &&
            (title !== collection.title ||
                description !== (collection.description ?? "") ||
                coverImageUrl !== (collection.cover_image_url ?? "") ||
                isPublic !== collection.is_public)
    );

    function handleDiscard() {
        if (!collection) return;
        title = collection.title;
        description = collection.description ?? "";
        coverImageUrl = collection.cover_image_url ?? "";
        isPublic = collection.is_public;
        coverError = false;
    }

    async function handleSave() {
        if (!collection) return;
        isSaving = true;
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() === "" ? undefined : description.trim(),
                cover_image_url: coverImageUrl.trim() === "" ? undefined : coverImageUrl.trim(),
                is_public: isPublic,
            };
            await updateCollection(collection.id, payload);
            collection = { ...collection, ...payload };
            toast.success("Collection mise à jour");
        } catch (err) {
            toast.error("Impossible d'enregistrer les modifications");
        } finally {
            isSaving = false;
        }
    }

    function openEditVideoDialog(video: CollectionVideo) {
        editingVideo = video;
        editVideoTitle = video.title;
        editVideoThumbnailUrl = video.thumbnail_url ?? "";
        editVideoThumbnailError = false;
        isEditVideoDialogOpen = true;
    }

    async function handleSaveVideoEdit() {
        if (!editingVideo) return;
        isSavingVideoEdit = true;
        // try {
        //     const payload = {
        //         title: editVideoTitle.trim(),
        //         thumbnail_url: editVideoThumbnailUrl.trim() === "" ? undefined : editVideoThumbnailUrl.trim(),
        //     };
        //     await updateCollectionVideo(collectionId, editingVideo.video_id, payload);
        //     videos = videos.map((v) =>
        //         v.video_id === editingVideo!.video_id ? { ...v, ...payload } : v
        //     );
        //     isEditVideoDialogOpen = false;
        //     toast.success("Vidéo mise à jour");
        // } catch (err) {
        //     toast.error("Impossible de mettre à jour la vidéo");
        // } finally {
        //     isSavingVideoEdit = false;
        // }
    }

    async function handleDeleteCollection() {
        if (!collection) return;
        isDeleting = true;
        try {
            await deleteCollection(collection.id);
            toast.success("Collection supprimée");
            goto("/admin/collections");
        } catch (err) {
            toast.error("Impossible de supprimer la collection");
        } finally {
            isDeleting = false;
        }
    }
</script>

<div class="container mx-auto max-w-6xl py-10 space-y-6 pb-28">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
            <Button variant="ghost" size="sm" class="w-fit -ml-2 text-muted-foreground" onclick={() => goto("/admin/collections")}>
                <ArrowLeftIcon class="size-4 mr-2" />
                Retour aux collections
            </Button>
            <div class="flex items-center gap-3">
                <h1 class="text-3xl font-bold tracking-tight">{collection?.title ?? "Modification"}</h1>
                {#if !isLoading && collection}
                    <Badge variant={isPublic ? "default" : "secondary"} class="gap-1">
                        {#if isPublic}
                            <GlobeIcon class="size-3" /> Publique
                        {:else}
                            <LockIcon class="size-3" /> Brouillon
                        {/if}
                    </Badge>
                {/if}
            </div>
        </div>
        <!-- <Button variant="outline" class="text-destructive hover:bg-destructive/10 hover:text-destructive" onclick={() => (isDeleteDialogOpen = true)}>
            <TrashIcon class="size-4 mr-2" />
            Supprimer
        </Button> -->
    </div>

    {#if isLoading}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 h-72 rounded-lg border bg-muted/40 animate-pulse"></div>
            <div class="lg:col-span-1 h-72 rounded-lg border bg-muted/40 animate-pulse"></div>
        </div>
    {:else if collection}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <!-- Colonne Gauche : Configuration (2/3) -->
            <div class="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                        <CardDescription>Le titre et la description apparaissent sur la page publique de la collection.</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-5">
                        <div class="grid gap-2">
                            <Label for="title">Titre</Label>
                            <Input id="title" bind:value={title} placeholder="Ex. Meilleurs moments 2024" class="max-w-lg" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="description">Description</Label>
                            <Textarea
                                id="description"
                                bind:value={description}
                                rows={4}
                                placeholder="Décrivez le contenu de cette collection..."
                            />
                            <p class="text-xs text-muted-foreground text-right">{description.length}/500</p>
                        </div>
                        <div class="grid gap-2">
                            <Label for="cover">Image de couverture</Label>
                            <div class="flex items-start gap-3">
                                <div class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                    {#if coverImageUrl && !coverError}
                                        <img
                                            src={coverImageUrl}
                                            alt="Aperçu de la couverture"
                                            class="size-full object-cover"
                                            onerror={() => (coverError = true)}
                                        />
                                    {:else}
                                        <ImageIcon class="size-6 text-muted-foreground" />
                                    {/if}
                                </div>
                                <div class="flex-1 space-y-1">
                                    <Input
                                        id="cover"
                                        bind:value={coverImageUrl}
                                        placeholder="https://..."
                                        oninput={() => (coverError = false)}
                                    />
                                    <p class="text-xs text-muted-foreground">Format recommandé : 1280×720, JPG ou PNG.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Visibilité</CardTitle>
                        <CardDescription>Contrôlez qui peut voir cette collection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center justify-between rounded-lg border p-4">
                            <div class="flex items-start gap-3">
                                {#if isPublic}
                                    <GlobeIcon class="size-5 text-primary mt-0.5" />
                                {:else}
                                    <LockIcon class="size-5 text-muted-foreground mt-0.5" />
                                {/if}
                                <div class="space-y-0.5">
                                    <Label for="public-switch">Visibilité publique</Label>
                                    <p class="text-sm text-muted-foreground">
                                        {isPublic
                                            ? "Visible par tous sur le réseau."
                                            : "Visible uniquement par vous, en brouillon."}
                                    </p>
                                </div>
                            </div>
                            <Switch id="public-switch" bind:checked={isPublic} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Colonne Droite : Vidéos (1/3) -->
            <div class="lg:col-span-1">
                <Card class="sticky top-6">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0">
                        <div class="flex items-center gap-2">
                            <CardTitle>Vidéos</CardTitle>
                            <Badge variant="secondary">{videos.length}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" class="size-8" onclick={() => (isCreateVideoOpen = true)}>
                            <PlusIcon class="size-4" />
                            <span class="sr-only">Ajouter une vidéo</span>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {#if isLoadingVideos}
                            <div class="space-y-2">
                                {#each Array(3) as _}
                                    <div class="h-12 rounded-md border bg-muted/40 animate-pulse"></div>
                                {/each}
                            </div>
                        {:else if videos.length === 0}
                            <Empty.Root class="border border-dashed rounded-lg py-8">
                                <Empty.Header>
                                    <Empty.Media variant="icon">
                                        <VideoOffIcon class="size-5" />
                                    </Empty.Media>
                                    <Empty.Title>Aucune vidéo</Empty.Title>
                                    <Empty.Description>Ajoutez des vidéos pour composer cette collection.</Empty.Description>
                                </Empty.Header>
                                <Button size="sm" variant="outline" onclick={() => (isCreateVideoOpen = true)}>
                                    <PlusIcon class="size-4 mr-2" />
                                    Ajouter une vidéo
                                </Button>
                            </Empty.Root>
                        {:else}
                            <ScrollArea class="max-h-[500px] pr-3">
                                <div class="space-y-2">
                                    {#each videos as video (video.video_id)}
                                        <Item.Root variant="outline">
                                            <Item.Media variant="image">
                                                <img
                                                    src={video.thumbnail_url}
                                                    alt={video.title}
                                                    width="32"
                                                    height="32"
                                                    class="size-8 rounded object-cover"
                                                />
                                            </Item.Media>
                                            <Item.Content>
                                                <Item.Title class="line-clamp-1">{video.title}</Item.Title>
                                            </Item.Content>
                                            <!-- <Button
                                                variant="ghost"
                                                size="icon"
                                                class="size-7"
                                                onclick={() => openEditVideoDialog(video)}
                                            >
                                                <PencilIcon class="size-3.5" />
                                                <span class="sr-only">Modifier les infos de la vidéo</span>
                                            </Button> -->
                                        </Item.Root>
                                    {/each}
                                </div>
                            </ScrollArea>
                        {/if}
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Barre d'action flottante : uniquement s'il y a des changements -->
        {#if hasChanges}
            <div class="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur">
                <div class="container mx-auto max-w-6xl flex items-center justify-between py-3">
                    <p class="text-sm text-muted-foreground">Modifications non enregistrées</p>
                    <div class="flex gap-2">
                        <Button variant="ghost" onclick={handleDiscard} disabled={isSaving}>Annuler</Button>
                        <Button onclick={handleSave} disabled={isSaving}>
                            {#if isSaving}
                                <Spinner class="size-4 mr-2" /> Enregistrement...
                            {:else}
                                Enregistrer les modifications
                            {/if}
                        </Button>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>

<!-- Drawer/Dialog partagé du layout : créer une vidéo et l'ajouter à cette collection -->
<CreateVideoDrawer bind:open={isCreateVideoOpen} collectionId={collection?.id} collectionTitle={collection?.title} />

<!-- Dialog : modification des infos d'une vidéo -->
<Dialog.Root bind:open={isEditVideoDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Modifier la vidéo</Dialog.Title>
            <Dialog.Description>Ces informations sont spécifiques à cette vidéo.</Dialog.Description>
        </Dialog.Header>

        <div class="space-y-4">
            <div class="grid gap-2">
                <Label for="edit-video-title">Titre</Label>
                <Input id="edit-video-title" bind:value={editVideoTitle} />
            </div>
            <div class="grid gap-2">
                <Label for="edit-video-thumbnail">Miniature</Label>
                <div class="flex items-start gap-3">
                    <div class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {#if editVideoThumbnailUrl && !editVideoThumbnailError}
                            <img
                                src={editVideoThumbnailUrl}
                                alt="Aperçu de la miniature"
                                class="size-full object-cover"
                                onerror={() => (editVideoThumbnailError = true)}
                            />
                        {:else}
                            <ImageIcon class="size-5 text-muted-foreground" />
                        {/if}
                    </div>
                    <Input
                        id="edit-video-thumbnail"
                        bind:value={editVideoThumbnailUrl}
                        placeholder="https://..."
                        oninput={() => (editVideoThumbnailError = false)}
                        class="flex-1"
                    />
                </div>
            </div>
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => (isEditVideoDialogOpen = false)} disabled={isSavingVideoEdit}>
                Annuler
            </Button>
            <Button onclick={handleSaveVideoEdit} disabled={!editVideoTitle.trim() || isSavingVideoEdit}>
                {#if isSavingVideoEdit}
                    <Spinner class="size-4 mr-2" /> Enregistrement...
                {:else}
                    Enregistrer
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- AlertDialog : suppression de la collection -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Supprimer cette collection ?</AlertDialog.Title>
            <AlertDialog.Description>
                Cette action est irréversible. La collection sera définitivement supprimée, mais les vidéos qu'elle
                contient resteront disponibles ailleurs.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={isDeleting}>Annuler</AlertDialog.Cancel>
            <AlertDialog.Action
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onclick={handleDeleteCollection}
            >
                {#if isDeleting}
                    <Spinner class="size-4 mr-2" /> Suppression...
                {:else}
                    Supprimer définitivement
                {/if}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>