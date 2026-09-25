import { listConversations } from './api';
import { messagingSocket } from './ws';

import type { WSEvent } from './types';
import { getWsToken } from '$lib/assets/api/ws-token';

class UnreadStore {
	hasUnread = $state(false);
	private initialized = false;
	private currentUserId = '';

	// À appeler une fois, au montage du layout racine, une fois qu'on sait
	// que l'utilisateur est authentifié et premium (la messagerie est
	// réservée aux comptes premium côté backend — RequirePremium).
	async init(currentUserId: string) {
		if (this.initialized) return;
		this.initialized = true;
		this.currentUserId = currentUserId;

		try {
			const page = await listConversations();
			this.hasUnread = page.conversations.some((c) => c.has_unread);
		} catch {
			// best-effort : un échec ici ne doit jamais bloquer le reste de l'app
		}

		messagingSocket.connect(async () => (await getWsToken()).token);
		messagingSocket.onEvent(this.handleEvent);
	}

	private handleEvent = (event: WSEvent) => {
		// Un nouveau message reçu (pas envoyé par moi) rend la pastille
		// active. On ne sait pas ici si la conversation concernée est
		// actuellement ouverte à l'écran — ConversationThread appelle déjà
		// markConversationAsRead dans ce cas, ce qui renverra un event "read"
		// qu'on pourrait suivre plus finement si besoin plus tard.
		if (event.type === 'message' && event.sender_id !== this.currentUserId) {
			this.hasUnread = true;
		}
	};

	// À appeler quand l'utilisateur vient de tout lire (ex: après avoir
	// ouvert la liste des conversations et qu'aucune n'a plus has_unread).
	clear() {
		this.hasUnread = false;
	}

	// Recalcule proprement depuis le serveur — utile après avoir quitté
	// /messages, pour être sûr qu'aucune autre conversation n'a encore des
	// messages non lus avant d'éteindre la pastille.
	async refresh() {
		try {
			const page = await listConversations();
			this.hasUnread = page.conversations.some((c) => c.has_unread);
		} catch {
			// best-effort
		}
	}
}

export const unreadStore = new UnreadStore();