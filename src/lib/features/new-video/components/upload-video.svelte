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
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
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
{/if}