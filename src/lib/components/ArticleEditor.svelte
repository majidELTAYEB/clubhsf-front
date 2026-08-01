<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { BubbleMenu as BubbleMenuExt } from '@tiptap/extension-bubble-menu';
	import { FloatingMenu as FloatingMenuExt } from '@tiptap/extension-floating-menu';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Underline from '@tiptap/extension-underline';
	import TextAlign from '@tiptap/extension-text-align';
	import { TextStyle } from '@tiptap/extension-text-style';
	import Color from '@tiptap/extension-color';
	import {Table} from '@tiptap/extension-table';
	import TableRow from '@tiptap/extension-table-row';
	import TableHeader from '@tiptap/extension-table-header';
	import TableCell from '@tiptap/extension-table-cell';
	import Placeholder from '@tiptap/extension-placeholder';
	import Bold from '@lucide/svelte/icons/bold';
	import Italic from '@lucide/svelte/icons/italic';
	import UnderlineIcon from '@lucide/svelte/icons/underline';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import Code from '@lucide/svelte/icons/code';
	import LinkIcon from '@lucide/svelte/icons/link';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import AlignCenter from '@lucide/svelte/icons/align-center';
	import AlignRight from '@lucide/svelte/icons/align-right';
	import Heading1 from '@lucide/svelte/icons/heading-1';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Quote from '@lucide/svelte/icons/quote';
	import ListIcon from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import ImageIcon from '@lucide/svelte/icons/image';
	import TableIcon from '@lucide/svelte/icons/table';
	import CodeSquare from '@lucide/svelte/icons/square-code';
	import { uploadArticleImage } from '$lib/features/admin-collection/api';

	let {
		content = $bindable<object | null>(null),
		editable = true
	}: { content?: object | null; editable?: boolean } = $props();

	let editorEl: HTMLDivElement;
	let bubbleMenuEl: HTMLDivElement;
	let floatingMenuEl: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let isUploading = $state(false);
	let fileInput: HTMLInputElement;

	let updateTick = $state(0);

	onMount(() => {
		editor = new Editor({
			element: editorEl,
			editable,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3] }
				}),
				Underline,
				Link.configure({ openOnClick: false, autolink: true }),
				Image,
				TextAlign.configure({ types: ['heading', 'paragraph'] }),
				TextStyle,
				Color,
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell,
				Placeholder.configure({ placeholder: 'Écris ton article ici…' }),
				BubbleMenuExt.configure({ element: bubbleMenuEl }),
				FloatingMenuExt.configure({ element: floatingMenuEl })
			],
			content: content ?? '',
			onUpdate: ({ editor }) => {
				content = editor.getJSON();
				updateTick++;
			},
			onSelectionUpdate: () => {
				updateTick++;
			},
			onTransaction: () => {
				updateTick++;
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	async function handleImagePick(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file || !editor) return;

		isUploading = true;
		try {
			const url = await uploadArticleImage(file);
			editor.chain().focus().setImage({ src: url }).run();
		} catch (err) {
			console.error(err);
			alert("Échec de l'upload de l'image");
		} finally {
			isUploading = false;
			(e.target as HTMLInputElement).value = '';
		}
	}

	function setLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL du lien', previousUrl ?? 'https://');
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}
</script>

<input type="file" accept="image/*" bind:this={fileInput} onchange={handleImagePick} hidden />


<div bind:this={bubbleMenuEl} class="bubble-menu">
	{#if editor}
		{#key updateTick}
			<button
				class:active={editor.isActive('bold')}
				onclick={() => editor?.chain().focus().toggleBold().run()}
				title="Gras"
			>
				<Bold size={14} strokeWidth={2} />
			</button>
			<button
				class:active={editor.isActive('italic')}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				title="Italique"
			>
				<Italic size={14} strokeWidth={2} />
			</button>
			<button
				class:active={editor.isActive('underline')}
				onclick={() => editor?.chain().focus().toggleUnderline().run()}
				title="Souligné"
			>
				<UnderlineIcon size={14} strokeWidth={2} />
			</button>
			<button
				class:active={editor.isActive('strike')}
				onclick={() => editor?.chain().focus().toggleStrike().run()}
				title="Barré"
			>
				<Strikethrough size={14} strokeWidth={2} />
			</button>
			<button
				class:active={editor.isActive('code')}
				onclick={() => editor?.chain().focus().toggleCode().run()}
				title="Code inline"
			>
				<Code size={14} strokeWidth={2} />
			</button>
			<button class:active={editor.isActive('link')} onclick={setLink} title="Lien">
				<LinkIcon size={14} strokeWidth={2} />
			</button>
			<span class="divider"></span>
			<button
				class:active={editor.isActive({ textAlign: 'left' })}
				onclick={() => editor?.chain().focus().setTextAlign('left').run()}
				title="Aligner à gauche"
			>
				<AlignLeft size={14} strokeWidth={2} />
			</button>
			<button
				class:active={editor.isActive({ textAlign: 'center' })}
				onclick={() => editor?.chain().focus().setTextAlign('center').run()}
				title="Centrer"
			>
				<AlignCenter size={14} strokeWidth={2} />
			</button>
			<button
				class:active={editor.isActive({ textAlign: 'right' })}
				onclick={() => editor?.chain().focus().setTextAlign('right').run()}
				title="Aligner à droite"
			>
				<AlignRight size={14} strokeWidth={2} />
			</button>
			<span class="divider"></span>
			<input
				type="color"
				class="color-swatch"
				oninput={(e) =>
					editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
				title="Couleur du texte"
			/>
		{/key}
	{/if}
</div>


<div bind:this={floatingMenuEl} class="floating-menu">
	{#if editor}
		<button onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Titre 1">
			<Heading1 size={15} strokeWidth={2} />
		</button>
		<button onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre 2">
			<Heading2 size={15} strokeWidth={2} />
		</button>
		<button onclick={() => editor?.chain().focus().toggleBulletList().run()} title="Liste à puces">
			<ListIcon size={15} strokeWidth={2} />
		</button>
		<button onclick={() => editor?.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
			<ListOrdered size={15} strokeWidth={2} />
		</button>
		<button onclick={() => editor?.chain().focus().toggleBlockquote().run()} title="Citation">
			<Quote size={15} strokeWidth={2} />
		</button>
		<button onclick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Bloc de code">
			<CodeSquare size={15} strokeWidth={2} />
		</button>
		<button
			onclick={() =>
				editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
			title="Tableau"
		>
			<TableIcon size={15} strokeWidth={2} />
		</button>
		<button onclick={() => fileInput.click()} disabled={isUploading} title="Image">
			<ImageIcon size={15} strokeWidth={2} />
		</button>
	{/if}
</div>

<div class="editor-wrapper" class:uploading={isUploading}>
	<div bind:this={editorEl}></div>
</div>

<style>
	.editor-wrapper {
		font-family: 'Fraunces', serif;
		font-size: 1rem;
		line-height: 1.7;
		color: #121210;
	}

	.editor-wrapper.uploading {
		opacity: 0.6;
		pointer-events: none;
	}

	:global(.editor-wrapper .ProseMirror) {
		outline: none;
		min-height: 320px;
	}

	:global(.editor-wrapper .ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #a09c92;
		pointer-events: none;
		height: 0;
	}

	:global(.editor-wrapper .ProseMirror img) {
		max-width: 100%;
		height: auto;
	}

	:global(.editor-wrapper .ProseMirror table) {
		border-collapse: collapse;
		width: 100%;
		margin: 1rem 0;
	}
	:global(.editor-wrapper .ProseMirror td),
	:global(.editor-wrapper .ProseMirror th) {
		border: 1px solid #e6e3db;
		padding: 0.5rem 0.75rem;
	}
	:global(.editor-wrapper .ProseMirror th) {
		background: #f4f3ef;
		font-weight: 600;
	}

	:global(.editor-wrapper .ProseMirror blockquote) {
		border-left: 2px solid #b23a1f;
		margin-left: 0;
		padding-left: 1rem;
		font-style: italic;
		color: #2b2a26;
	}

	:global(.editor-wrapper .ProseMirror pre) {
		background: #121210;
		color: #f4f3ef;
		padding: 0.75rem 1rem;
		border-radius: 4px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		overflow-x: auto;
	}

	.bubble-menu,
	.floating-menu {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		background: #121210;
		border-radius: 6px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
	}

	.bubble-menu button,
	.floating-menu button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		color: #fff;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.bubble-menu button:hover,
	.floating-menu button:hover {
		background: rgba(255, 255, 255, 0.15);
	}
	.bubble-menu button.active {
		background: #b23a1f;
	}
	.bubble-menu button:disabled,
	.floating-menu button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.divider {
		width: 1px;
		height: 18px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0 2px;
	}

	.color-swatch {
		width: 22px;
		height: 22px;
		padding: 0;
		border: none;
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
	}
</style>