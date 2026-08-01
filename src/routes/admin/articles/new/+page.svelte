<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { Spinner } from "$lib/components/ui/spinner";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import FolderIcon from "@lucide/svelte/icons/folder";
    import ImageIcon from "@lucide/svelte/icons/image";
    import { toast } from "svelte-sonner";

    import ArticleEditor from "$lib/components/ArticleEditor.svelte";
    import { createArticle, addArticleToCollection, uploadArticleImage } from "$lib/features/admin-collection/api";

    // --- Contexte "collection" venu de l'URL (?collection=uuid&collectionTitle=...) ---
    const collectionId = page.url.searchParams.get("collection") ?? undefined;
    const collectionTitle = page.url.searchParams.get("collectionTitle") ?? undefined;

    // --- État du formulaire ---
    let title = $state("");
    let excerpt = $state("");
    let content = $state<object | null>(null);
    let coverImageUrl = $state("");
    let isUploadingCover = $state(false);
    let coverFileInput: HTMLInputElement;

    let isSaving = $state(false);
    let error = $state<string | null>(null);

    function validate(): string | null {
        if (title.trim() === "") return "Le titre est requis";
        if (!content) return "Le contenu est requis";
        return null;
    }

    function targetRoute(): string {
        return collectionId ? `/admin/collections/${collectionId}` : "/admin/articles";
    }

    async function handleCoverPick(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        isUploadingCover = true;
        try {
            coverImageUrl = await uploadArticleImage(file);

            console.log(coverImageUrl)
        } catch (err) {
            toast.error("Échec de l'upload de l'image de couverture");
        } finally {
            isUploadingCover = false;
            (e.target as HTMLInputElement).value = "";
        }
    }

    /**
     * Crée l'article puis, si une collection est fournie, l'y rattache.
     * Gère les toasts de progression/succès/erreur de bout en bout.
     */
    async function publishArticle() {
        const toastId = toast.loading(`Publication de "${title}"`, {
            description: "Création de l'article...",
        });

        const result = await createArticle({
            title: title.trim(),
            excerpt: excerpt.trim() === "" ? undefined : excerpt.trim(),
            content: content as object,
            cover_image_url: coverImageUrl || undefined,
        });
        const article = result.data;

        if (collectionId) {
            toast.loading(`Publication de "${title}"`, {
                id: toastId,
                description: "Ajout à la collection...",
            });
            try {
                await addArticleToCollection(collectionId, article.id);
            } catch (err) {
                console.error("Impossible d'ajouter l'article à la collection", err);
                toast.warning("Article créé, mais l'ajout à la collection a échoué", {
                    description: "Tu pourras l'ajouter manuellement plus tard.",
                });
                return article; // l'article existe malgré tout
            }
        }

        toast.success("Article publié !", {
            id: toastId,
            description: `"${title}" a été créé avec succès.`,
        });

        return article;
    }

    async function handlePublish() {
        error = null;

        const validationError = validate();
        if (validationError) {
            error = validationError;
            return;
        }

        isSaving = true;
        try {
            await publishArticle();
            goto(targetRoute());
        } catch (err) {
            error = err instanceof Error ? err.message : "Erreur inconnue";
            toast.error("Échec de la publication", { description: error });
        } finally {
            isSaving = false;
        }
    }

    function handleBack() {
        goto(targetRoute());
    }
</script>

<svelte:head>
    <title>Nouvel article</title>
</svelte:head>

<div class="container mx-auto max-w-3xl py-10 space-y-6 pb-28">
    <div class="flex flex-col gap-1">
        <Button type="button" variant="ghost" size="sm" class="w-fit -ml-2 text-muted-foreground" onclick={handleBack}>
            <ArrowLeftIcon class="size-4 mr-2" />
            {collectionId ? "Retour à la collection" : "Retour aux articles"}
        </Button>
        <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold tracking-tight">Nouvel article</h1>
            {#if collectionId}
                <Badge variant="secondary" class="gap-1.5 font-normal">
                    <FolderIcon class="size-3" />
                    {collectionTitle ?? "Cette collection"}
                </Badge>
            {/if}
        </div>
    </div>

    {#if error}
        <Alert.Root variant="destructive">
            <AlertCircleIcon class="size-4" />
            <Alert.Title>Erreur</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
    {/if}

    <Card>
        <CardContent class="space-y-5 pt-6">
            <div class="grid gap-2">
                <Label for="title">Titre</Label>
                <Input
                    id="title"
                    bind:value={title}
                    placeholder="Titre de l'article"
                    class="text-lg font-medium"
                />
            </div>
            <div class="grid gap-2">
                <Label for="excerpt">Résumé (optionnel)</Label>
                <Textarea
                    id="excerpt"
                    bind:value={excerpt}
                    rows={2}
                    placeholder="Un court résumé affiché dans les listes..."
                />
            </div>
            <div class="grid gap-2">
                <Label>Image de couverture</Label>
                <input
                    type="file"
                    accept="image/*"
                    bind:this={coverFileInput}
                    onchange={handleCoverPick}
                    hidden
                />
                <div class="flex items-start gap-3">
                    <button
                        type="button"
                        class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"
                        onclick={() => coverFileInput.click()}
                        disabled={isUploadingCover}
                    >
                        {#if isUploadingCover}
                            <Spinner class="size-5" />
                        {:else if coverImageUrl}
                            <img src={coverImageUrl} alt="Couverture" class="size-full object-cover" />
                        {:else}
                            <ImageIcon class="size-6 text-muted-foreground" />
                        {/if}
                    </button>
                    <div class="flex-1 space-y-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onclick={() => coverFileInput.click()}
                            disabled={isUploadingCover}
                        >
                            {coverImageUrl ? "Changer l'image" : "Choisir une image"}
                        </Button>
                        <p class="text-xs text-muted-foreground">Format recommandé : 1280×720, JPG ou PNG.</p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>

    <Card>
        <CardHeader>
            <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
            <ArticleEditor bind:content />
        </CardContent>
    </Card>
</div>

<!-- Barre d'action flottante -->
<div class="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur">
    <div class="container mx-auto max-w-3xl flex items-center justify-end gap-2 py-3">
        <Button type="button" variant="ghost" onclick={handleBack} disabled={isSaving}>Annuler</Button>
        <Button type="button" onclick={handlePublish} disabled={isSaving}>
            {#if isSaving}
                <Spinner class="size-4 mr-2" /> Publication...
            {:else}
                Publier
            {/if}
        </Button>
    </div>
</div>