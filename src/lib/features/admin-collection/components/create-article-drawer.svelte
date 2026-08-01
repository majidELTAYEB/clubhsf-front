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
    import { Badge } from "$lib/components/ui/badge/index.js";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import CheckIcon from "@lucide/svelte/icons/check";
    import FolderIcon from "@lucide/svelte/icons/folder";
    import { toast } from "svelte-sonner";

    import ArticleEditor from "$lib/components/ArticleEditor.svelte";
    import { createArticle } from "../api";
    // import { addArticleToCollection } from "$lib/services/collections";
    import { getCollections, createCollection } from "../../new-video/api";

    import type { Collection } from "../types";

    let {
        open = $bindable(false),
        collectionId,
        collectionTitle,
    }: { open?: boolean; collectionId?: string; collectionTitle?: string } = $props();

    const isDesktop = new MediaQuery("(min-width: 768px)");
    const id = $props.id();

    // Si on ouvre le drawer depuis une collection précise, on saute
    // l'étape de sélection de collection : elle est déjà connue.
    const lockedCollection = $derived(collectionId !== undefined);
    const totalSteps = $derived(lockedCollection ? 1 : 2);
    const displayStep = $derived(lockedCollection ? 1 : step);

    // États du formulaire (2 étapes : détails+contenu -> collection)
    let step = $state(1);
    let title = $state("");
    let excerpt = $state("");
    let content = $state<object | null>(null);
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
            collections = Array.isArray(result.data) ? result.data : [];
        } catch (err) {
            console.error("Erreur lors du chargement des collections", err);
        } finally {
            isLoadingCollections = false;
        }
    }

    function resetForm() {
        step = 1;
        title = "";
        excerpt = "";
        content = null;
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
            const newCollection = result.data;
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
            if (lockedCollection) {
                selectedCollectionId = collectionId;
            } else {
                loadCollections();
            }
        } else {
            setTimeout(resetForm, 300);
        }
    });

    function nextStep() {
        error = null;
        if (step === 1 && title.trim() !== "" && content !== null) {
            step = 2;
        }
    }

    function prevStep() {
        error = null;
        if (isCreating) return;
        if (step === 2) {
            step = 1;
        }
    }

    async function handleCreate() {
        if (!content) return;

        isCreating = true;
        error = null;

        const articleTitle = title;
        const toastId = toast.loading(`Publication de "${articleTitle}"`, {
            description: "Création de l'article...",
        });

        try {
            const result = await createArticle({
                title: articleTitle,
                excerpt: excerpt.trim() === "" ? undefined : excerpt.trim(),
                content,
            });
            const article = result.data;

            if (selectedCollectionId) {
                toast.loading(`Publication de "${articleTitle}"`, {
                    id: toastId,
                    description: "Ajout à la collection...",
                });
                try {
                    // await addArticleToCollection(selectedCollectionId, article.id);
                } catch (err) {
                    console.error("Impossible d'ajouter l'article à la collection", err);
                    toast.warning("Article créé, mais l'ajout à la collection a échoué", {
                        description: "Tu pourras l'ajouter manuellement plus tard.",
                    });
                }
            }

            toast.success(`Article publié !`, {
                id: toastId,
                description: `"${articleTitle}" a été créé avec succès.`,
            });

            open = false;
        } catch (err) {
            isCreating = false;
            const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

            if (open) {
                error = errorMessage;
                toast.dismiss(toastId);
            } else {
                toast.error(`Erreur de publication`, {
                    id: toastId,
                    description: errorMessage,
                });
            }
        }
    }
</script>

{#snippet stepIndicator()}
    <div class="grid gap-1.5">
        <Progress value={(displayStep / totalSteps) * 100} class="h-1.5" />
        <p class="text-xs text-muted-foreground text-right">Étape {displayStep} sur {totalSteps}</p>
    </div>
{/snippet}

{#snippet step1()}
    <div class="grid gap-4">
        {#if lockedCollection}
            <Badge variant="secondary" class="w-fit gap-1.5 font-normal">
                <FolderIcon class="size-3" />
                Ajouté à {collectionTitle ?? "cette collection"}
            </Badge>
        {/if}
        <div class="grid gap-2">
            <Label for="title-{id}">Titre de l'article</Label>
            <Input id="title-{id}" bind:value={title} placeholder="Mon super article" required />
        </div>
        <div class="grid gap-2">
            <Label for="excerpt-{id}">Résumé (optionnel)</Label>
            <Textarea
                id="excerpt-{id}"
                bind:value={excerpt}
                placeholder="Un court résumé affiché dans les listes..."
                rows={2}
            />
        </div>
        <div class="grid gap-2">
            <Label>Contenu</Label>
            <div class="rounded-md border px-4 py-3 max-h-[420px] overflow-y-auto">
                <ArticleEditor bind:content />
            </div>
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
        {#if lockedCollection}
            <Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
            <Button onclick={handleCreate} disabled={title.trim() === "" || !content || isCreating}>
                {#if isCreating}
                    <Spinner class="size-4 mr-2" /> Publication...
                {:else}
                    Publier
                {/if}
            </Button>
        {:else if step === 1}
            <Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
            <Button onclick={nextStep} disabled={title.trim() === "" || !content}>Suivant</Button>
        {:else if step === 2}
            <Button variant="outline" onclick={prevStep} disabled={isCreatingCollectionMode || isCreating}>
                Précédent
            </Button>
            <Button onclick={handleCreate} disabled={isCreatingCollectionMode || isCreating}>
                {#if isCreating}
                    <Spinner class="size-4 mr-2" /> Publication...
                {:else}
                    Publier
                {/if}
            </Button>
        {/if}
    </div>
{/snippet}

{#if isDesktop.current}
    <Dialog.Root bind:open>
        <Dialog.Content class="sm:max-w-[600px]">
            <Dialog.Header>
                <Dialog.Title>
                    {#if lockedCollection || step === 1} Rédiger l'article
                    {:else} Collection
                    {/if}
                </Dialog.Title>
                <Dialog.Description>
                    {#if lockedCollection || step === 1} Donne un titre et écris le contenu de ton article.
                    {:else} Ajoute-le à une collection si tu le souhaites.
                    {/if}
                </Dialog.Description>
            </Dialog.Header>

            {@render stepIndicator()}

            <div class="py-2">
                {#if lockedCollection || step === 1} {@render step1()}
                {:else if step === 2} {@render step2Collection()}
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
                    {#if lockedCollection || step === 1} Rédiger l'article
                    {:else} Collection
                    {/if}
                </Drawer.Title>
                <Drawer.Description>
                    {#if lockedCollection || step === 1} Donne un titre et écris le contenu de ton article.
                    {:else} Ajoute-le à une collection si tu le souhaites.
                    {/if}
                </Drawer.Description>
            </Drawer.Header>

            <div class="px-4">
                {@render stepIndicator()}
            </div>

            <div class="px-4 py-2">
                {#if lockedCollection || step === 1} {@render step1()}
                {:else if step === 2} {@render step2Collection()}
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