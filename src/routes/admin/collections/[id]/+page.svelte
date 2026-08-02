<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";

	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Spinner } from "$lib/components/ui/spinner";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import * as Item from "$lib/components/ui/item/index.js";

	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import ImageIcon from "@lucide/svelte/icons/image";
	import ImageOffIcon from "@lucide/svelte/icons/image-off";
	import GlobeIcon from "@lucide/svelte/icons/globe";
	import LockIcon from "@lucide/svelte/icons/lock";
	import VideoOffIcon from "@lucide/svelte/icons/video-off";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import CheckIcon from "@lucide/svelte/icons/check";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";

	import {
		getCollection,
		getCollectionItems,
		updateCollection,
		deleteCollection,
		deleteVideo,
		removeItemFromCollection,
	} from "$lib/features/admin-collection/api";
	import CreateVideoDrawer from "$lib/features/admin-collection/components/create-video-drawer.svelte";

	// ──────────────────────────────────────────────────────────────────────
	// Types
	// ──────────────────────────────────────────────────────────────────────

	type VideoStatus = "ready" | "processing" | "queued" | "failed";

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
		status?: VideoStatus;
		position: number;
	};

	type CollectionArticle = {
		article_id: string;
		title: string;
		slug: string;
		excerpt?: string;
		cover_image_url?: string;
		position: number;
	};

	type CollectionItem =
		| { item_type: "video"; position: number; video: Omit<CollectionVideo, "position"> }
		| { item_type: "article"; position: number; article: Omit<CollectionArticle, "position"> };

	const STATUS_CONFIG: Record<VideoStatus, { label: string; icon: typeof CheckIcon; class: string }> = {
		ready: { label: "Prêt", icon: CheckIcon, class: "text-emerald-600" },
		processing: { label: "En traitement", icon: LoaderIcon, class: "text-amber-600" },
		queued: { label: "En attente", icon: LoaderIcon, class: "text-muted-foreground" },
		failed: { label: "Échec", icon: TriangleAlertIcon, class: "text-destructive" },
	};

	function getStatus(status?: VideoStatus) {
		return (
			STATUS_CONFIG[status as VideoStatus] ?? {
				label: status ?? "Inconnu",
				icon: TriangleAlertIcon,
				class: "text-muted-foreground",
			}
		);
	}

	function isSpinning(status?: VideoStatus) {
		return status === "processing" || status === "queued";
	}

	// ──────────────────────────────────────────────────────────────────────
	// State: collection
	// ──────────────────────────────────────────────────────────────────────

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

	const hasChanges = $derived(
		collection !== null &&
			(title !== collection.title ||
				description !== (collection.description ?? "") ||
				coverImageUrl !== (collection.cover_image_url ?? "") ||
				isPublic !== collection.is_public)
	);

	async function loadCollection() {
		isLoading = true;
		try {
			const result = await getCollection(collectionId);
			collection = result.data;
			title = collection.title;
			description = collection.description ?? "";
			coverImageUrl = collection.cover_image_url ?? "";
			isPublic = collection.is_public;
		} catch {
			toast.error("Impossible de charger la collection");
		} finally {
			isLoading = false;
		}
	}

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
				description: description.trim() || undefined,
				cover_image_url: coverImageUrl.trim() || undefined,
				is_public: isPublic,
			};
			await updateCollection(collection.id, payload);
			collection = { ...collection, ...payload };
			toast.success("Collection mise à jour");
		} catch {
			toast.error("Impossible d'enregistrer les modifications");
		} finally {
			isSaving = false;
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// State: collection items (videos + articles)
	// ──────────────────────────────────────────────────────────────────────

	let videos = $state<CollectionVideo[]>([]);
	let articles = $state<CollectionArticle[]>([]);
	let isLoadingItems = $state(true);
	let brokenThumbs = $state(new Set<string>());

	function byPosition(a: { position: number }, b: { position: number }) {
		return a.position - b.position;
	}

	async function loadItems() {
		isLoadingItems = true;
		try {
			const { data } = await getCollectionItems(collectionId);

			videos = data
				.filter((item: CollectionItem): item is Extract<CollectionItem, { item_type: "video" }> => item.item_type === "video")
				.map((item) => ({ ...item.video, position: item.position }))
				.sort(byPosition);

			articles = data
				.filter((item: CollectionItem): item is Extract<CollectionItem, { item_type: "article" }> => item.item_type === "article")
				.map((item) => ({ ...item.article, position: item.position }))
				.sort(byPosition);
		} catch {
			toast.error("Impossible de charger les vidéos et articles de la collection");
		} finally {
			isLoadingItems = false;
		}
	}

	function handleThumbError(videoId: string) {
		brokenThumbs.add(videoId);
		brokenThumbs = new Set(brokenThumbs); // force la réactivité
	}

	onMount(() => {
		loadCollection();
		loadItems();
	});

	// ──────────────────────────────────────────────────────────────────────
	// Add video drawer — reload items once it closes
	// ──────────────────────────────────────────────────────────────────────

	let isCreateVideoOpen = $state(false);
	let wasCreateVideoOpen = $state(false);

	$effect(() => {
		if (wasCreateVideoOpen && !isCreateVideoOpen) {
			loadItems();
		}
		wasCreateVideoOpen = isCreateVideoOpen;
	});

	// ──────────────────────────────────────────────────────────────────────
	// Remove video
	// ──────────────────────────────────────────────────────────────────────

	let isRemoveVideoDialogOpen = $state(false);
	let videoToRemove = $state<CollectionVideo | null>(null);
	let isRemovingVideo = $state(false);

	function openRemoveVideoDialog(video: CollectionVideo) {
		videoToRemove = video;
		isRemoveVideoDialogOpen = true;
	}

	async function handleRemoveVideo() {
		if (!videoToRemove || !collection) return;
		isRemovingVideo = true;
		try {
			await removeItemFromCollection(collection.id, "video", videoToRemove.video_id);
			await deleteVideo(videoToRemove.video_id);
			videos = videos.filter((v) => v.video_id !== videoToRemove!.video_id);
			toast.success("Vidéo supprimée");
			isRemoveVideoDialogOpen = false;
		} catch {
			toast.error("Impossible de supprimer la vidéo");
		} finally {
			isRemovingVideo = false;
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// Remove article
	// ──────────────────────────────────────────────────────────────────────

	let isRemoveArticleDialogOpen = $state(false);
	let articleToRemove = $state<CollectionArticle | null>(null);
	let isRemovingArticle = $state(false);

	function openRemoveArticleDialog(article: CollectionArticle) {
		articleToRemove = article;
		isRemoveArticleDialogOpen = true;
	}

	async function handleRemoveArticle() {
		if (!articleToRemove || !collection) return;
		isRemovingArticle = true;
		try {
			await removeItemFromCollection(collection.id, "article", articleToRemove.article_id);
			articles = articles.filter((a) => a.article_id !== articleToRemove!.article_id);
			toast.success("Article retiré de la collection");
			isRemoveArticleDialogOpen = false;
		} catch {
			toast.error("Impossible de retirer l'article");
		} finally {
			isRemovingArticle = false;
		}
	}

	// ──────────────────────────────────────────────────────────────────────
	// Delete collection
	// ──────────────────────────────────────────────────────────────────────

	let isDeleteDialogOpen = $state(false);
	let isDeleting = $state(false);

	async function handleDeleteCollection() {
		if (!collection) return;
		isDeleting = true;
		try {
			await deleteCollection(collection.id);
			toast.success("Collection supprimée");
			goto("/admin/collections");
		} catch {
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
	</div>

	{#if isLoading}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2 h-72 rounded-lg border bg-muted/40 animate-pulse"></div>
			<div class="lg:col-span-1 h-72 rounded-lg border bg-muted/40 animate-pulse"></div>
		</div>
	{:else if collection}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
			<!-- Colonne gauche : configuration -->
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
							<Textarea id="description" bind:value={description} rows={4} placeholder="Décrivez le contenu de cette collection..." />
							<p class="text-xs text-muted-foreground text-right">{description.length}/500</p>
						</div>
						<div class="grid gap-2">
							<Label for="cover">Image de couverture</Label>
							<div class="flex items-start gap-3">
								<div class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
									{#if coverImageUrl && !coverError}
										<img src={coverImageUrl} alt="Aperçu de la couverture" class="size-full object-cover" onerror={() => (coverError = true)} />
									{:else}
										<ImageIcon class="size-6 text-muted-foreground" />
									{/if}
								</div>
								<div class="flex-1 space-y-1">
									<Input id="cover" bind:value={coverImageUrl} placeholder="https://..." oninput={() => (coverError = false)} />
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
										{isPublic ? "Visible par tous sur le réseau." : "Visible uniquement par vous, en brouillon."}
									</p>
								</div>
							</div>
							<Switch id="public-switch" bind:checked={isPublic} />
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Colonne droite : vidéos + articles -->
			<div class="lg:col-span-1 space-y-6">
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
						{#if isLoadingItems}
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
										{@const status = getStatus(video.status)}
										<Item.Root variant="outline">
											<Item.Media variant="image">
												{#if video.thumbnail_url && !brokenThumbs.has(video.video_id)}
													<img
														src={video.thumbnail_url}
														alt={video.title}
														width="32"
														height="32"
														class="size-8 rounded object-cover"
														onerror={() => handleThumbError(video.video_id)}
													/>
												{:else}
													<div class="flex size-8 items-center justify-center rounded bg-muted">
														<ImageOffIcon class="size-3.5 text-muted-foreground" />
													</div>
												{/if}
											</Item.Media>
											<Item.Content>
												<Item.Title class="line-clamp-1">{video.title}</Item.Title>
												<div class="flex items-center gap-1 text-xs {status.class}">
													<status.icon class="size-3 {isSpinning(video.status) ? 'animate-spin' : ''}" />
													<span>{status.label}</span>
												</div>
											</Item.Content>
											<Button
												variant="ghost"
												size="icon"
												class="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
												onclick={() => openRemoveVideoDialog(video)}
											>
												<TrashIcon class="size-4" />
												<span class="sr-only">Supprimer la vidéo</span>
											</Button>
										</Item.Root>
									{/each}
								</div>
							</ScrollArea>
						{/if}
					</CardContent>
				</Card>

				<Card class="sticky top-6">
					<CardHeader class="flex flex-row items-center justify-between space-y-0">
						<div class="flex items-center gap-2">
							<CardTitle>Articles</CardTitle>
							<Badge variant="secondary">{articles.length}</Badge>
						</div>
						<Button variant="ghost" size="icon" class="size-8" onclick={() => goto(`/admin/articles/new?collection=${collection?.id}`)}>
							<PlusIcon class="size-4" />
							<span class="sr-only">Ajouter un article</span>
						</Button>
					</CardHeader>
					<CardContent>
						{#if isLoadingItems}
							<div class="space-y-2">
								{#each Array(3) as _}
									<div class="h-12 rounded-md border bg-muted/40 animate-pulse"></div>
								{/each}
							</div>
						{:else if articles.length === 0}
							<Empty.Root class="border border-dashed rounded-lg py-8">
								<Empty.Header>
									<Empty.Media variant="icon">
										<ImageOffIcon class="size-5" />
									</Empty.Media>
									<Empty.Title>Aucun article</Empty.Title>
									<Empty.Description>Ajoutez des articles pour composer cette collection.</Empty.Description>
								</Empty.Header>
								<Button
									size="sm"
									variant="outline"
									onclick={() =>
										goto(`/admin/articles/new?collection=${collection?.id}&collectionTitle=${encodeURIComponent(collection?.title ?? "")}`)}
								>
									<PlusIcon class="size-4 mr-2" />
									Ajouter un article
								</Button>
							</Empty.Root>
						{:else}
							<ScrollArea class="max-h-[500px] pr-3">
								<div class="space-y-2">
									{#each articles as article (article.article_id)}
										<Item.Root variant="outline">
											<Item.Media variant="image">
												{#if article.cover_image_url}
													<img src={article.cover_image_url} alt={article.title} width="32" height="32" class="size-8 rounded object-cover" />
												{:else}
													<div class="flex size-8 items-center justify-center rounded bg-muted">
														<ImageOffIcon class="size-3.5 text-muted-foreground" />
													</div>
												{/if}
											</Item.Media>
											<Item.Content>
												<Item.Title class="line-clamp-1">{article.title}</Item.Title>
												{#if article.excerpt}
													<p class="text-xs text-muted-foreground line-clamp-1">{article.excerpt}</p>
												{/if}
											</Item.Content>
											<Button
												variant="ghost"
												size="icon"
												class="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
												onclick={() => openRemoveArticleDialog(article)}
											>
												<TrashIcon class="size-4" />
												<span class="sr-only">Retirer l'article</span>
											</Button>
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

<!-- Drawer partagé : créer une vidéo et l'ajouter à cette collection -->
<CreateVideoDrawer bind:open={isCreateVideoOpen} collectionId={collection?.id} collectionTitle={collection?.title} />

<!-- Suppression de la collection -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Supprimer cette collection ?</AlertDialog.Title>
			<AlertDialog.Description>
				Cette action est irréversible. La collection sera définitivement supprimée, mais les vidéos qu'elle contient resteront disponibles ailleurs.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isDeleting}>Annuler</AlertDialog.Cancel>
			<AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting} onclick={handleDeleteCollection}>
				{#if isDeleting}
					<Spinner class="size-4 mr-2" /> Suppression...
				{:else}
					Supprimer définitivement
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Suppression d'une vidéo -->
<AlertDialog.Root bind:open={isRemoveVideoDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Supprimer cette vidéo ?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if videoToRemove}
					« {videoToRemove.title} » sera définitivement supprimée. Cette action est irréversible.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isRemovingVideo}>Annuler</AlertDialog.Cancel>
			<AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isRemovingVideo} onclick={handleRemoveVideo}>
				{#if isRemovingVideo}
					<Spinner class="size-4 mr-2" /> Suppression...
				{:else}
					Supprimer
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Retrait d'un article -->
<AlertDialog.Root bind:open={isRemoveArticleDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Retirer cet article ?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if articleToRemove}
					« {articleToRemove.title} » sera retiré de cette collection. L'article restera disponible ailleurs.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isRemovingArticle}>Annuler</AlertDialog.Cancel>
			<AlertDialog.Action
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				disabled={isRemovingArticle}
				onclick={handleRemoveArticle}
			>
				{#if isRemovingArticle}
					<Spinner class="size-4 mr-2" /> Suppression...
				{:else}
					Retirer
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>