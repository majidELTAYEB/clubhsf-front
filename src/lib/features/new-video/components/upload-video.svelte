<!-- <script lang="ts">
    import { MediaQuery } from "svelte/reactivity";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Drawer from "$lib/components/ui/drawer/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import { toast } from "svelte-sonner";
    
    import * as tus from "tus-js-client";
    import { createVideo, getUploadCredentials } from "../api";

    let { open = $bindable(false) }: { open?: boolean } = $props();
    const isDesktop = new MediaQuery("(min-width: 768px)");
    const id = $props.id();

    // États du formulaire (réduit à 2 étapes)
    let step = $state(1);
    let title = $state("");
    let description = $state("");
    let files = $state<FileList>();
    
    // États de chargement
    let isCreating = $state(false); 
    let error = $state<string | null>(null);

    function resetForm() {
        step = 1;
        title = "";
        description = "";
        files = undefined;
        isCreating = false;
        error = null;
    }

    $effect(() => {
        if (!open) {
            setTimeout(resetForm, 300);
        }
    });

    function nextStep() {
        error = null;
        if (step === 1 && title.trim() !== "") {
            step = 2;
        }
    }

    function prevStep() {
        error = null;
        if (step === 2 && !isCreating) {
            step = 1;
        }
    }

    async function handleUpload() {
    if (!files || files.length === 0) return;

    const file = files[0];
    isCreating = true;
    error = null;

    const videoTitle = title
    
    // 1. Toast initial (beau et descriptif)
    const toastId = toast.loading(`Upload de "${videoTitle}"`, {
        description: "Création de la vidéo en base de données...",
    });

    try {
        const payload = {
            title : videoTitle,
            description: description.trim() === "" ? undefined : description,
        };
        const videoData = await createVideo(payload); 
        
        toast.loading(`Upload de "${videoTitle}"`, { 
            id: toastId,
            description: "Génération des accès sécurisés..." 
        });
        
        const creds = await getUploadCredentials(videoData.ID);

        // 2. On ferme la modale
        open = false; 

        // 3. Upload TUS
        const upload = new tus.Upload(file, {
            endpoint: creds.Endpoint, 
            retryDelays: [0, 3000, 5000, 10000, 20000],
            uploadSize: file.size,
            headers: {
                AuthorizationSignature: creds.AuthSignature,
                AuthorizationExpire: creds.AuthExpire.toString(),
                VideoId: creds.VideoID,
                LibraryId: creds.LibraryID,
            },
            metadata: {
                filename: file.name,
                filetype: file.type,
            },
            onError: (err) => {
                toast.error(`Échec de l'upload`, { 
                    id: toastId,
                    description: err.message
                });
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                if (bytesTotal > 0) {
                    const percent = Math.round((bytesUploaded / bytesTotal) * 100);
                    // On garde le titre en haut, et on met à jour le pourcentage dans la description
                    toast.loading(`Upload de "${videoTitle}"`, { 
                        id: toastId,
                        description: `Envoi en cours : ${percent}%` 
                    });
                }
            },
            onSuccess: () => {
                toast.success(`Vidéo envoyée avec succès !`, { 
                    id: toastId,
                    description: `"${videoTitle}" est maintenant prête.`,
                    action: {
                        label: "Voir",
                        onClick: () => {
                            // Ici tu pourras mettre ta redirection plus tard
                            // console.log("Redirection vers la vidéo", videoData.ID)
                        }
                    }
                });
            },
        });

        upload.start();
        
    } catch (err) {
        isCreating = false;
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        
        if (open) {
            error = errorMessage;
            toast.dismiss(toastId); 
        } else {
            toast.error(`Erreur d'initialisation`, { 
                id: toastId,
                description: errorMessage 
            });
        }
    }
}
</script>

{#snippet stepIndicator()}
    <div class="grid gap-1.5">
        <Progress value={(step / 2) * 100} class="h-1.5" />
        <p class="text-xs text-muted-foreground text-right">Étape {step} sur 2</p>
    </div>
{/snippet}

{#snippet step1()}
    <div class="grid gap-4">
        <div class="grid gap-2">
            <Label for="title-{id}">Titre de la vidéo</Label>
            <Input id="title-{id}" bind:value={title} placeholder="Ma super vidéo" required />
        </div>
        <div class="grid gap-2">
            <Label for="description-{id}">Description</Label>
            <Textarea
                id="description-{id}"
                bind:value={description}
                placeholder="Décris le contenu..."
                rows={4}
            />
        </div>
    </div>
{/snippet}

{#snippet step2()}
    <div class="grid gap-4">
        <div class="grid gap-2">
            <Label for="file-{id}">Fichier vidéo</Label>
            <Input 
                id="file-{id}" 
                type="file" 
                accept="video/*" 
                bind:files={files} 
                disabled={isCreating} 
            />
        </div>
    </div>
{/snippet}

{#snippet errorAlert()}
    {#if error}
        <Alert.Root variant="destructive">
            <AlertCircleIcon class="size-4" />
            <Alert.Title>Erreur</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
    {/if}
{/snippet}

{#snippet footerButtons()}
    <div class="flex w-full justify-between mt-4">
        {#if step === 1}
            <Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
            <Button onclick={nextStep} disabled={title.trim() === ""}>Suivant</Button>
        {:else if step === 2}
            <Button variant="outline" onclick={prevStep} disabled={isCreating}>
                Précédent
            </Button>
            <Button onclick={handleUpload} disabled={!files || files.length === 0 || isCreating}>
                {#if isCreating}
                    <Spinner class="size-4 mr-2" /> Initialisation...
                {:else}
                    Uploader
                {/if}
            </Button>
        {/if}
    </div>
{/snippet}

{#if isDesktop.current}
    <Dialog.Root bind:open>
        <Dialog.Content class="sm:max-w-[500px]">
            <Dialog.Header>
                <Dialog.Title>
                    {#if step === 1} Détails de la vidéo
                    {:else} Sélection du fichier
                    {/if}
                </Dialog.Title>
                <Dialog.Description>
                    {#if step === 1} Commence par donner un nom à ta vidéo.
                    {:else} Choisis le fichier depuis ton ordinateur.
                    {/if}
                </Dialog.Description>
            </Dialog.Header>

            {@render stepIndicator()} 

            <div class="py-2">
                {#if step === 1} {@render step1()}
                {:else if step === 2} {@render step2()}
                {/if}
            </div>

            {@render errorAlert()}
            {@render footerButtons()}
        </Dialog.Content>
    </Dialog.Root>
{:else}
    <Drawer.Root bind:open>
        <Drawer.Content>
            <Drawer.Header class="text-start">
                <Drawer.Title>
                    {#if step === 1} Détails de la vidéo
                    {:else} Sélection du fichier
                    {/if}
                </Drawer.Title>
                <Drawer.Description>
                    {#if step === 1} Commence par donner un nom à ta vidéo.
                    {:else} Choisis le fichier depuis ton ordinateur.
                    {/if}
                </Drawer.Description>
            </Drawer.Header>

            {@render stepIndicator()} 

            <div class="px-4 py-2">
                {#if step === 1} {@render step1()}
                {:else if step === 2} {@render step2()}
                {/if}
            </div>

            <div class="px-4">
                {@render errorAlert()}
                {@render footerButtons()}
            </div>

            <Drawer.Footer class="pt-2">
                {#if !isCreating}
                    <Drawer.Close class={buttonVariants({ variant: "ghost" })}>Fermer</Drawer.Close>
                {/if}
            </Drawer.Footer>
        </Drawer.Content>
    </Drawer.Root>
{/if} -->

<!-- <script lang="ts">
    import { MediaQuery } from "svelte/reactivity";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Drawer from "$lib/components/ui/drawer/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import * as InputGroup from "$lib/components/ui/input-group/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import CheckIcon from "@lucide/svelte/icons/check";
    import { toast } from "svelte-sonner";

    import * as tus from "tus-js-client";
    import { createVideo, getUploadCredentials, getCollections, createCollection } from "../api";

    let { open = $bindable(false) }: { open?: boolean } = $props();
    const isDesktop = new MediaQuery("(min-width: 768px)");
    const id = $props.id();

    // États du formulaire (3 étapes : détails -> collection -> fichier)
    let step = $state(1);
    let title = $state("");
    let description = $state("");
    let files = $state<FileList>();
    let selectedCollectionId = $state<string | undefined>(undefined);

    // Collections
    let collections = $state<{ ID: string; Name: string }[]>([]);
    let isLoadingCollections = $state(false);
    let isCreatingCollectionMode = $state(false);
    let newCollectionName = $state("");
    let isCreatingCollection = $state(false);
    let collectionError = $state<string | null>(null);

    // États de chargement
    let isCreating = $state(false);
    let error = $state<string | null>(null);

    async function loadCollections() {
        isLoadingCollections = true;
        try {
            collections = await getCollections();
        } catch (err) {
            console.error("Erreur lors du chargement des collections", err);
        } finally {
            isLoadingCollections = false;
        }
    }

    function resetForm() {
        step = 1;
        title = "";
        description = "";
        files = undefined;
        selectedCollectionId = undefined;
        isCreating = false;
        error = null;
        isCreatingCollectionMode = false;
        newCollectionName = "";
        isCreatingCollection = false;
        collectionError = null;
    }

    function enterCreateCollectionMode() {
        collectionError = null;
        newCollectionName = "";
        isCreatingCollectionMode = true;
    }

    function cancelCreateCollectionMode() {
        collectionError = null;
        newCollectionName = "";
        isCreatingCollectionMode = false;
    }

    async function handleCreateCollection() {
        const name = newCollectionName.trim();
        if (name === "") return;

        isCreatingCollection = true;
        collectionError = null;

        try {
            const newCollection = await createCollection({ name });
            collections = [...collections, newCollection];
            selectedCollectionId = newCollection.ID;
            isCreatingCollectionMode = false;
            newCollectionName = "";
            toast(`Collection "${newCollection.Name}" créée`);
        } catch (err) {
            collectionError =
                err instanceof Error ? err.message : "Impossible de créer la collection";
        } finally {
            isCreatingCollection = false;
        }
    }

    $effect(() => {
        if (open) {
            loadCollections();
        } else {
            setTimeout(resetForm, 300);
        }
    });

    function nextStep() {
        error = null;
        if (step === 1 && title.trim() !== "") {
            step = 2;
        } else if (step === 2) {
            step = 3;
        }
    }

    function prevStep() {
        error = null;
        if (isCreating) return;
        if (step === 2) {
            step = 1;
        } else if (step === 3) {
            step = 2;
        }
    }

    async function handleUpload() {
        if (!files || files.length === 0) return;

        const file = files[0];
        isCreating = true;
        error = null;

        const videoTitle = title;

        // 1. Toast initial (beau et descriptif)
        const toastId = toast.loading(`Upload de "${videoTitle}"`, {
            description: "Création de la vidéo en base de données...",
        });

        try {
            const payload = {
                title: videoTitle,
                description: description.trim() === "" ? undefined : description,
                collectionId: selectedCollectionId ?? undefined,
            };
            const videoData = await createVideo(payload);

            toast.loading(`Upload de "${videoTitle}"`, {
                id: toastId,
                description: "Génération des accès sécurisés...",
            });

            const creds = await getUploadCredentials(videoData.ID);

            // 2. On ferme la modale
            open = false;

            // 3. Upload TUS
            const upload = new tus.Upload(file, {
                endpoint: creds.Endpoint,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                uploadSize: file.size,
                headers: {
                    AuthorizationSignature: creds.AuthSignature,
                    AuthorizationExpire: creds.AuthExpire.toString(),
                    VideoId: creds.VideoID,
                    LibraryId: creds.LibraryID,
                },
                metadata: {
                    filename: file.name,
                    filetype: file.type,
                },
                onError: (err) => {
                    toast.error(`Échec de l'upload`, {
                        id: toastId,
                        description: err.message,
                    });
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    if (bytesTotal > 0) {
                        const percent = Math.round((bytesUploaded / bytesTotal) * 100);
                        // On garde le titre en haut, et on met à jour le pourcentage dans la description
                        toast.loading(`Upload de "${videoTitle}"`, {
                            id: toastId,
                            description: `Envoi en cours : ${percent}%`,
                        });
                    }
                },
                onSuccess: () => {
                    toast.success(`Vidéo envoyée avec succès !`, {
                        id: toastId,
                        description: `"${videoTitle}" est maintenant prête.`,
                        action: {
                            label: "Voir",
                            onClick: () => {
                                // Ici tu pourras mettre ta redirection plus tard
                                // console.log("Redirection vers la vidéo", videoData.ID)
                            },
                        },
                    });
                },
            });

            upload.start();
        } catch (err) {
            isCreating = false;
            const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

            if (open) {
                error = errorMessage;
                toast.dismiss(toastId);
            } else {
                toast.error(`Erreur d'initialisation`, {
                    id: toastId,
                    description: errorMessage,
                });
            }
        }
    }
</script>

{#snippet stepIndicator()}
    <div class="grid gap-1.5">
        <Progress value={(step / 3) * 100} class="h-1.5" />
        <p class="text-xs text-muted-foreground text-right">Étape {step} sur 3</p>
    </div>
{/snippet}

{#snippet step1()}
    <div class="grid gap-4">
        <div class="grid gap-2">
            <Label for="title-{id}">Titre de la vidéo</Label>
            <Input id="title-{id}" bind:value={title} placeholder="Ma super vidéo" required />
        </div>
        <div class="grid gap-2">
            <Label for="description-{id}">Description</Label>
            <Textarea
                id="description-{id}"
                bind:value={description}
                placeholder="Décris le contenu..."
                rows={4}
            />
        </div>
    </div>
{/snippet}

{#snippet step2Collection()}
    <div class="grid gap-4">
        {#if !isCreatingCollectionMode}
            <div class="grid gap-2">
                <Label for="collection-{id}">Collection (optionnel)</Label>
                <div class="flex gap-2">
                    <Select.Root type="single" bind:value={selectedCollectionId}>
                        <Select.Trigger id="collection-{id}" class="flex-1">
                            {#if isLoadingCollections}
                                Chargement...
                            {:else}
                                {collections.find((c) => c.ID === selectedCollectionId)?.Name ??
                                    "Aucune collection"}
                            {/if}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value={undefined}>Aucune collection</Select.Item>
                            {#if !isLoadingCollections && collections.length === 0}
                                <div class="px-2 py-1.5 text-sm text-muted-foreground">
                                    Aucune collection existante
                                </div>
                            {/if}
                            {#each collections as collection}
                                <Select.Item value={collection.ID}>{collection.Name}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onclick={enterCreateCollectionMode}
                        title="Créer une nouvelle collection"
                    >
                        <PlusIcon class="size-4" />
                    </Button>
                </div>
                {#if !isLoadingCollections && collections.length === 0}
                    <p class="text-xs text-muted-foreground">
                        Tu n'as pas encore de collection. Clique sur "+" pour en créer une.
                    </p>
                {/if}
            </div>
        {:else}
            <div class="grid gap-2">
                <div class="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="size-7"
                        onclick={cancelCreateCollectionMode}
                        disabled={isCreatingCollection}
                        title="Retour à la sélection"
                    >
                        <ArrowLeftIcon class="size-4" />
                    </Button>
                    <Label for="new-collection-{id}">Nom de la nouvelle collection</Label>
                </div>
                <InputGroup.Root>
                    <InputGroup.Input
                        id="new-collection-{id}"
                        bind:value={newCollectionName}
                        placeholder="Ma collection"
                        disabled={isCreatingCollection}
                        onkeydown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleCreateCollection();
                            }
                        }}
                    />
                    <InputGroup.Addon align="inline-end">
                        <button
                            type="button"
                            onclick={handleCreateCollection}
                            disabled={newCollectionName.trim() === "" || isCreatingCollection}
                            // class="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full"
                            class="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full"
                            title="Créer la collection"
                        >
                            {#if isCreatingCollection}
                                <Spinner class="size-4" />
                            {:else}
                                <CheckIcon class="size-4" />
                            {/if}
                        </button>
                    </InputGroup.Addon>
                </InputGroup.Root>
                {#if collectionError}
                    <p class="text-xs text-destructive">{collectionError}</p>
                {/if}
            </div>
        {/if}
    </div>
{/snippet}

{#snippet step3File()}
    <div class="grid gap-4">
        <div class="grid gap-2">
            <Label for="file-{id}">Fichier vidéo</Label>
            <Input
                id="file-{id}"
                type="file"
                accept="video/*"
                bind:files={files}
                disabled={isCreating}
            />
        </div>
    </div>
{/snippet}

{#snippet errorAlert()}
    {#if error}
        <Alert.Root variant="destructive">
            <AlertCircleIcon class="size-4" />
            <Alert.Title>Erreur</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
    {/if}
{/snippet}

{#snippet footerButtons()}
    <div class="flex w-full justify-between mt-4">
        {#if step === 1}
            <Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
            <Button onclick={nextStep} disabled={title.trim() === ""}>Suivant</Button>
        {:else if step === 2}
            <Button variant="outline" onclick={prevStep} disabled={isCreatingCollectionMode}>
                Précédent
            </Button>
            <Button onclick={nextStep} disabled={isCreatingCollectionMode}>Suivant</Button>
        {:else if step === 3}
            <Button variant="outline" onclick={prevStep} disabled={isCreating}>
                Précédent
            </Button>
            <Button onclick={handleUpload} disabled={!files || files.length === 0 || isCreating}>
                {#if isCreating}
                    <Spinner class="size-4 mr-2" /> Initialisation...
                {:else}
                    Uploader
                {/if}
            </Button>
        {/if}
    </div>
{/snippet}

{#if isDesktop.current}
    <Dialog.Root bind:open>
        <Dialog.Content class="sm:max-w-[500px]">
            <Dialog.Header>
                <Dialog.Title>
                    {#if step === 1} Détails de la vidéo
                    {:else if step === 2} Collection
                    {:else} Sélection du fichier
                    {/if}
                </Dialog.Title>
                <Dialog.Description>
                    {#if step === 1} Commence par donner un nom à ta vidéo.
                    {:else if step === 2} Ajoute-la à une collection si tu le souhaites.
                    {:else} Choisis le fichier depuis ton ordinateur.
                    {/if}
                </Dialog.Description>
            </Dialog.Header>

            {@render stepIndicator()}

            <div class="py-2">
                {#if step === 1} {@render step1()}
                {:else if step === 2} {@render step2Collection()}
                {:else if step === 3} {@render step3File()}
                {/if}
            </div>

            {@render errorAlert()}
            {@render footerButtons()}
        </Dialog.Content>
    </Dialog.Root>
{:else}
    <Drawer.Root bind:open>
        <Drawer.Content>
            <Drawer.Header class="text-start">
                <Drawer.Title>
                    {#if step === 1} Détails de la vidéo
                    {:else if step === 2} Collection
                    {:else} Sélection du fichier
                    {/if}
                </Drawer.Title>
                <Drawer.Description>
                    {#if step === 1} Commence par donner un nom à ta vidéo.
                    {:else if step === 2} Ajoute-la à une collection si tu le souhaites.
                    {:else} Choisis le fichier depuis ton ordinateur.
                    {/if}
                </Drawer.Description>
            </Drawer.Header>

            <div class="px-4">
                {@render stepIndicator()}
            </div>

            <div class="px-4 py-2">
                {#if step === 1} {@render step1()}
                {:else if step === 2} {@render step2Collection()}
                {:else if step === 3} {@render step3File()}
                {/if}
            </div>

            <div class="px-4">
                {@render errorAlert()}
                {@render footerButtons()}
            </div>

            <Drawer.Footer class="pt-2">
                {#if !isCreating}
                    <Drawer.Close class={buttonVariants({ variant: "ghost" })}>Fermer</Drawer.Close>
                {/if}
            </Drawer.Footer>
        </Drawer.Content>
    </Drawer.Root>
{/if} -->


<script lang="ts">
    import { MediaQuery } from "svelte/reactivity";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Drawer from "$lib/components/ui/drawer/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import * as InputGroup from "$lib/components/ui/input-group/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import CheckIcon from "@lucide/svelte/icons/check";
    import { toast } from "svelte-sonner";

    import * as tus from "tus-js-client";
    import {
        createVideo,
        addVideoToCollection,
        getCollections,
        createCollection,
        getUploadCredentials,
    } from "../api";

    	import type { Collection } from "../types";

    let { open = $bindable(false) }: { open?: boolean } = $props();
    const isDesktop = new MediaQuery("(min-width: 768px)");
    const id = $props.id();

    // États du formulaire (3 étapes : détails -> collection -> fichier)
    let step = $state(1);
    let title = $state("");
    let description = $state("");
    let files = $state<FileList>();
    let selectedCollectionId = $state<string | undefined>(undefined);

    // Collections
    let collections = $state<Collection[]>([]);
    let isLoadingCollections = $state(false);
    let isCreatingCollectionMode = $state(false);
    let newCollectionName = $state("");
    let isCreatingCollection = $state(false);
    let collectionError = $state<string | null>(null);

    // États de chargement
    let isCreating = $state(false);
    let error = $state<string | null>(null);

    async function loadCollections() {
        isLoadingCollections = true;
        try {
            const result = await getCollections();
        collections = Array.isArray(result.data) ? result.data: [];
        } catch (err) {
            console.error("Erreur lors du chargement des collections", err);
        } finally {
            isLoadingCollections = false;
        }
    }

    function resetForm() {
        step = 1;
        title = "";
        description = "";
        files = undefined;
        selectedCollectionId = undefined;
        isCreating = false;
        error = null;
        isCreatingCollectionMode = false;
        newCollectionName = "";
        isCreatingCollection = false;
        collectionError = null;
    }

    function enterCreateCollectionMode() {
        collectionError = null;
        newCollectionName = "";
        isCreatingCollectionMode = true;
    }

    function cancelCreateCollectionMode() {
        collectionError = null;
        newCollectionName = "";
        isCreatingCollectionMode = false;
    }

    async function handleCreateCollection() {
        const name = newCollectionName.trim();
        if (name === "") return;

        isCreatingCollection = true;
        collectionError = null;

        try {
            const result = await createCollection({ title: name });
            const newCollection = result.data
            collections = [...collections, newCollection];
            selectedCollectionId = newCollection.id;
            isCreatingCollectionMode = false;
            newCollectionName = "";
            toast(`Collection "${newCollection.title}" créée`);
        } catch (err) {
            collectionError =
                err instanceof Error ? err.message : "Impossible de créer la collection";
        } finally {
            isCreatingCollection = false;
        }
    }

    $effect(() => {
        if (open) {
            loadCollections();
        } else {
            setTimeout(resetForm, 300);
        }
    });

    function nextStep() {
        error = null;
        if (step === 1 && title.trim() !== "") {
            step = 2;
        } else if (step === 2) {
            step = 3;
        }
    }

    function prevStep() {
        error = null;
        if (isCreating) return;
        if (step === 2) {
            step = 1;
        } else if (step === 3) {
            step = 2;
        }
    }

    async function handleUpload() {
        if (!files || files.length === 0) return;

        const file = files[0];
        isCreating = true;
        error = null;

        const videoTitle = title;

        // 1. Toast initial (beau et descriptif)
        const toastId = toast.loading(`Upload de "${videoTitle}"`, {
            description: "Création de la vidéo en base de données...",
        });

        try {
            // createVideo renvoie directement { video, upload_credentials } :
            // pas besoin d'un 2e appel à getUploadCredentials juste après.
            const video  = await createVideo({
                title: videoTitle,
                description: description.trim() === "" ? undefined : description,
            });

            // Le backend ne gère pas encore le rattachement à une collection
            // en un seul appel : on l'ajoute juste après si demandé. Si ça
            // échoue, la vidéo existe déjà, on prévient sans bloquer l'upload.
            if (selectedCollectionId) {
                toast.loading(`Upload de "${videoTitle}"`, {
                    id: toastId,
                    description: "Ajout à la collection...",
                });
                try {
                    await addVideoToCollection(selectedCollectionId, video.ID);
                } catch (err) {
                    console.error("Impossible d'ajouter la vidéo à la collection", err);
                    toast.warning("Vidéo créée, mais l'ajout à la collection a échoué", {
                        description: "Tu pourras l'ajouter manuellement plus tard.",
                    });
                }
            }

            toast.loading(`Upload de "${videoTitle}"`, {
                id: toastId,
                description: "Envoi du fichier...",
            });

            const creds = await getUploadCredentials(video.ID);

            // 2. On ferme la modale
            open = false;

            // 3. Upload TUS
            const upload = new tus.Upload(file, {
                endpoint: creds.Endpoint,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                uploadSize: file.size,
                headers: {
                    AuthorizationSignature: creds.AuthSignature,
                    AuthorizationExpire: creds.AuthExpire.toString(),
                    VideoId: creds.VideoID,
                    LibraryId: creds.LibraryID,
                },
                metadata: {
                    filename: file.name,
                    filetype: file.type,
                },
                onError: (err) => {
                    toast.error(`Échec de l'upload`, {
                        id: toastId,
                        description: err.message,
                    });
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    if (bytesTotal > 0) {
                        const percent = Math.round((bytesUploaded / bytesTotal) * 100);
                        // On garde le titre en haut, et on met à jour le pourcentage dans la description
                        toast.loading(`Upload de "${videoTitle}"`, {
                            id: toastId,
                            description: `Envoi en cours : ${percent}%`,
                        });
                    }
                },
                onSuccess: () => {
                    toast.success(`Vidéo envoyée avec succès !`, {
                        id: toastId,
                        description: `"${videoTitle}" est en cours de traitement.`,
                        action: {
                            label: "Voir",
                            onClick: () => {
                                // Redirection vers /videos/{video.id} à brancher plus tard
                            },
                        },
                    });
                },
            });

            upload.start();
        } catch (err) {
            isCreating = false;
            const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

            if (open) {
                error = errorMessage;
                toast.dismiss(toastId);
            } else {
                toast.error(`Erreur d'initialisation`, {
                    id: toastId,
                    description: errorMessage,
                });
            }
        }
    }
</script>

{#snippet stepIndicator()}
    <div class="grid gap-1.5">
        <Progress value={(step / 3) * 100} class="h-1.5" />
        <p class="text-xs text-muted-foreground text-right">Étape {step} sur 3</p>
    </div>
{/snippet}

{#snippet step1()}
    <div class="grid gap-4">
        <div class="grid gap-2">
            <Label for="title-{id}">Titre de la vidéo</Label>
            <Input id="title-{id}" bind:value={title} placeholder="Ma super vidéo" required />
        </div>
        <div class="grid gap-2">
            <Label for="description-{id}">Description</Label>
            <Textarea
                id="description-{id}"
                bind:value={description}
                placeholder="Décris le contenu..."
                rows={4}
            />
        </div>
    </div>
{/snippet}

{#snippet step2Collection()}
    <div class="grid gap-4">
        {#if !isCreatingCollectionMode}
            <div class="grid gap-2">
                <Label for="collection-{id}">Collection (optionnel)</Label>
                <div class="flex gap-2">
                    <Select.Root type="single" bind:value={selectedCollectionId}>
                        <Select.Trigger id="collection-{id}" class="flex-1">
                            {#if isLoadingCollections}
                                Chargement...
                            {:else}
                                {collections.find((c) => c.id === selectedCollectionId)?.title ??
                                    "Aucune collection"}
                            {/if}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value={undefined}>Aucune collection</Select.Item>
                            {#if !isLoadingCollections && collections.length === 0}
                                <div class="px-2 py-1.5 text-sm text-muted-foreground">
                                    Aucune collection existante
                                </div>
                            {/if}
                            {#each collections as collection}
                                <Select.Item value={collection.id}>{collection.title}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onclick={enterCreateCollectionMode}
                        title="Créer une nouvelle collection"
                    >
                        <PlusIcon class="size-4" />
                    </Button>
                </div>
                {#if !isLoadingCollections && collections.length === 0}
                    <p class="text-xs text-muted-foreground">
                        Tu n'as pas encore de collection. Clique sur "+" pour en créer une.
                    </p>
                {/if}
            </div>
        {:else}
            <div class="grid gap-2">
                <div class="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="size-7"
                        onclick={cancelCreateCollectionMode}
                        disabled={isCreatingCollection}
                        title="Retour à la sélection"
                    >
                        <ArrowLeftIcon class="size-4" />
                    </Button>
                    <Label for="new-collection-{id}">Nom de la nouvelle collection</Label>
                </div>
                <InputGroup.Root>
                    <InputGroup.Input
                        id="new-collection-{id}"
                        bind:value={newCollectionName}
                        placeholder="Ma collection"
                        disabled={isCreatingCollection}
                        onkeydown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleCreateCollection();
                            }
                        }}
                    />
                    <InputGroup.Addon align="inline-end">
                        <button
                            type="button"
                            onclick={handleCreateCollection}
                            disabled={newCollectionName.trim() === "" || isCreatingCollection}
                            class="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full"
                            title="Créer la collection"
                        >
                            {#if isCreatingCollection}
                                <Spinner class="size-4" />
                            {:else}
                                <CheckIcon class="size-4" />
                            {/if}
                        </button>
                    </InputGroup.Addon>
                </InputGroup.Root>
                {#if collectionError}
                    <p class="text-xs text-destructive">{collectionError}</p>
                {/if}
            </div>
        {/if}
    </div>
{/snippet}

{#snippet step3File()}
    <div class="grid gap-4">
        <div class="grid gap-2">
            <Label for="file-{id}">Fichier vidéo</Label>
            <Input
                id="file-{id}"
                type="file"
                accept="video/*"
                bind:files={files}
                disabled={isCreating}
            />
        </div>
    </div>
{/snippet}

{#snippet errorAlert()}
    {#if error}
        <Alert.Root variant="destructive">
            <AlertCircleIcon class="size-4" />
            <Alert.Title>Erreur</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
    {/if}
{/snippet}

{#snippet footerButtons()}
    <div class="flex w-full justify-between mt-4">
        {#if step === 1}
            <Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
            <Button onclick={nextStep} disabled={title.trim() === ""}>Suivant</Button>
        {:else if step === 2}
            <Button variant="outline" onclick={prevStep} disabled={isCreatingCollectionMode}>
                Précédent
            </Button>
            <Button onclick={nextStep} disabled={isCreatingCollectionMode}>Suivant</Button>
        {:else if step === 3}
            <Button variant="outline" onclick={prevStep} disabled={isCreating}>
                Précédent
            </Button>
            <Button onclick={handleUpload} disabled={!files || files.length === 0 || isCreating}>
                {#if isCreating}
                    <Spinner class="size-4 mr-2" /> Initialisation...
                {:else}
                    Uploader
                {/if}
            </Button>
        {/if}
    </div>
{/snippet}

{#if isDesktop.current}
    <Dialog.Root bind:open>
        <Dialog.Content class="sm:max-w-[500px]">
            <Dialog.Header>
                <Dialog.Title>
                    {#if step === 1} Détails de la vidéo
                    {:else if step === 2} Collection
                    {:else} Sélection du fichier
                    {/if}
                </Dialog.Title>
                <Dialog.Description>
                    {#if step === 1} Commence par donner un nom à ta vidéo.
                    {:else if step === 2} Ajoute-la à une collection si tu le souhaites.
                    {:else} Choisis le fichier depuis ton ordinateur.
                    {/if}
                </Dialog.Description>
            </Dialog.Header>

            {@render stepIndicator()}

            <div class="py-2">
                {#if step === 1} {@render step1()}
                {:else if step === 2} {@render step2Collection()}
                {:else if step === 3} {@render step3File()}
                {/if}
            </div>

            {@render errorAlert()}
            {@render footerButtons()}
        </Dialog.Content>
    </Dialog.Root>
{:else}
    <Drawer.Root bind:open>
        <Drawer.Content>
            <Drawer.Header class="text-start">
                <Drawer.Title>
                    {#if step === 1} Détails de la vidéo
                    {:else if step === 2} Collection
                    {:else} Sélection du fichier
                    {/if}
                </Drawer.Title>
                <Drawer.Description>
                    {#if step === 1} Commence par donner un nom à ta vidéo.
                    {:else if step === 2} Ajoute-la à une collection si tu le souhaites.
                    {:else} Choisis le fichier depuis ton ordinateur.
                    {/if}
                </Drawer.Description>
            </Drawer.Header>

            <div class="px-4">
                {@render stepIndicator()}
            </div>

            <div class="px-4 py-2">
                {#if step === 1} {@render step1()}
                {:else if step === 2} {@render step2Collection()}
                {:else if step === 3} {@render step3File()}
                {/if}
            </div>

            <div class="px-4">
                {@render errorAlert()}
                {@render footerButtons()}
            </div>

            <Drawer.Footer class="pt-2">
                {#if !isCreating}
                    <Drawer.Close class={buttonVariants({ variant: "ghost" })}>Fermer</Drawer.Close>
                {/if}
            </Drawer.Footer>
        </Drawer.Content>
    </Drawer.Root>
{/if}