<!-- src/lib/components/collection-tile.svelte -->
<script lang="ts">
    import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';

    interface CollectionData {
        id: string;
        title: string;
        slug: string;
        description: string;
        cover_image_url: string | null;
        is_public: boolean;
        created_at: string;
        status?: string; 
    }

    // On déstructure data avec $props()
    let { data }: { data: CollectionData } = $props();

    // Utilisation de $derived pour que l'image soit réactive 
    // et pour gérer le fallback proprement
    let coverSrc = $derived(data.cover_image_url ?? 'https://i.scdn.co/image/ab67656300005f1f44b25cf070bce64670be3b90');
</script>

<a
    href="/collections/{data.slug}"
    class="group flex flex-col gap-2 transition-opacity hover:opacity-90"
>
    <div class="border-border relative overflow-hidden rounded-xl border bg-muted">
        <AspectRatio ratio={1}>
            <img
                src={coverSrc}
                alt="Cover de la collection {data.title}"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
        </AspectRatio>
    </div>
    <div class="space-y-1">
        <p class="text-sm leading-none font-medium">{data.title}</p>
    </div>
</a>