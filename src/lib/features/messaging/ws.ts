


// import { env } from '$env/dynamic/public';

// import type { WSEvent, WSOutgoingPayload } from './types';

// // /ws/messaging est monté à la racine du routeur Go.
// // L'authentification peut se faire via cookie ou via token query param.

// const WS_PATH = '/ws/messaging';

// function resolveWsUrl(token?: string | null): string {
//     const base =
//         import.meta.env.PUBLIC_API_URL as string | undefined;

//     let url: string;

//     if (base) {
//         url =
//             base
//                 .replace(/^http:/, 'ws:')
//                 .replace(/^https:/, 'wss:')
//                 .replace(/\/$/, '') +
//             WS_PATH;
//     } else {
//         const apiBaseUrl = env.PUBLIC_API_BASE_URL;

//         if (!apiBaseUrl) {
//             throw new Error(
//                 'PUBLIC_API_BASE_URL ou PUBLIC_API_URL doit être défini'
//             );
//         }

//         const apiHost = new URL(apiBaseUrl).host;

//         const proto =
//             window.location.protocol === 'https:'
//                 ? 'wss:'
//                 : 'ws:';

//         url = `${proto}//${apiHost}${WS_PATH}`;
//     }

//     if (token) {
//         url += `?token=${encodeURIComponent(token)}`;
//     }

//     return url;
// }

// type Listener<T> = (payload: T) => void;

// type SocketStatus = 'connecting' | 'open' | 'closed';

// const RECONNECT_BASE_DELAY_MS = 1000;
// const RECONNECT_MAX_DELAY_MS = 15000;

// export class MessagingSocket {
//     private socket: WebSocket | null = null;

//     private reconnectAttempt = 0;

//     private reconnectTimer:
//         ReturnType<typeof setTimeout> | undefined;

//     private manuallyClosed = false;

//     private messageListeners = new Set<
//         Listener<WSEvent>
//     >();

//     private statusListeners = new Set<
//         Listener<SocketStatus>
//     >();

//     private token: string | null = null;

//     /**
//      * Établit la connexion.
//      *
//      * Appelable plusieurs fois sans créer plusieurs WebSockets.
//      * C'est important avec Svelte 5 où plusieurs $effect peuvent
//      * potentiellement réagir au même changement.
//      */
//     connect(token?: string | null) {
//         if (token !== undefined) {
//             this.token = token;
//         }

//         this.manuallyClosed = false;

//         // Annule une reconnexion planifiée si une connexion
//         // explicite est demandée.
//         if (this.reconnectTimer) {
//             clearTimeout(this.reconnectTimer);
//             this.reconnectTimer = undefined;
//         }

//         // Une connexion existe déjà.
//         if (
//             this.socket &&
//             (
//                 this.socket.readyState === WebSocket.CONNECTING ||
//                 this.socket.readyState === WebSocket.OPEN
//             )
//         ) {
//             return;
//         }

//         this.open();
//     }

//     /**
//      * Ouvre le WebSocket.
//      */
//     private open() {
//         if (this.manuallyClosed) {
//             return;
//         }

//         // Protection supplémentaire contre les connexions
//         // concurrentes.
//         if (
//             this.socket &&
//             (
//                 this.socket.readyState === WebSocket.CONNECTING ||
//                 this.socket.readyState === WebSocket.OPEN
//             )
//         ) {
//             return;
//         }

//         this.emitStatus('connecting');

//         const socket = new WebSocket(
//             resolveWsUrl(this.token)
//         );

//         this.socket = socket;

//         socket.addEventListener('open', () => {
//             // Ce socket n'est plus le socket courant.
//             if (this.socket !== socket) {
//                 return;
//             }

//             this.reconnectAttempt = 0;

//             this.emitStatus('open');
//         });

//         socket.addEventListener('message', (event) => {
//             // Ignore les messages provenant d'un ancien socket.
//             if (this.socket !== socket) {
//                 return;
//             }

//             try {
//                 const payload = JSON.parse(
//                     event.data
//                 ) as WSEvent;

//                 this.messageListeners.forEach((listener) => {
//                     listener(payload);
//                 });
//             } catch {
//                 // Message non JSON : on l'ignore.
//             }
//         });

//         socket.addEventListener('close', () => {
//             // Très important :
//             // un ancien socket ne doit jamais déclencher
//             // une nouvelle reconnexion.
//             if (this.socket !== socket) {
//                 return;
//             }

//             this.socket = null;

//             this.emitStatus('closed');

//             if (!this.manuallyClosed) {
//                 this.scheduleReconnect();
//             }
//         });

//         socket.addEventListener('error', () => {
//             // On ne fait volontairement rien ici.
//             //
//             // Le navigateur déclenchera normalement "close"
//             // ensuite, et c'est "close" qui gère la reconnexion.
//             //
//             // Cela évite :
//             //
//             // error -> close() -> close -> reconnect
//             //
//             // avec plusieurs chemins de reconnexion.
//         });
//     }

//     /**
//      * Planifie une reconnexion avec backoff exponentiel.
//      *
//      * 1s -> 2s -> 4s -> 8s -> 15s -> 15s -> ...
//      */
//     private scheduleReconnect() {
//         if (this.manuallyClosed) {
//             return;
//         }

//         // Une seule reconnexion peut être planifiée.
//         if (this.reconnectTimer) {
//             return;
//         }

//         const delay = Math.min(
//             RECONNECT_BASE_DELAY_MS *
//                 2 ** this.reconnectAttempt,
//             RECONNECT_MAX_DELAY_MS
//         );

//         this.reconnectAttempt += 1;

//         this.reconnectTimer = setTimeout(() => {
//             this.reconnectTimer = undefined;

//             if (!this.manuallyClosed) {
//                 this.open();
//             }
//         }, delay);
//     }

//     /**
//      * Envoie un message au serveur.
//      */
//     send(payload: WSOutgoingPayload) {
//         if (
//             !this.socket ||
//             this.socket.readyState !== WebSocket.OPEN
//         ) {
//             throw new Error('WebSocket non connecté');
//         }

//         this.socket.send(JSON.stringify(payload));
//     }

//     /**
//      * Écoute les événements reçus du serveur.
//      *
//      * Retourne une fonction de cleanup.
//      */
//     onEvent(listener: Listener<WSEvent>) {
//         this.messageListeners.add(listener);

//         return () => {
//             this.messageListeners.delete(listener);
//         };
//     }

//     /**
//      * Écoute les changements d'état de la connexion.
//      *
//      * Retourne une fonction de cleanup.
//      */
//     onStatusChange(listener: Listener<SocketStatus>) {
//         this.statusListeners.add(listener);

//         return () => {
//             this.statusListeners.delete(listener);
//         };
//     }

//     private emitStatus(status: SocketStatus) {
//         this.statusListeners.forEach((listener) => {
//             listener(status);
//         });
//     }

//     /**
//      * Ferme définitivement la connexion.
//      *
//      * Aucune reconnexion ne sera effectuée ensuite jusqu'à
//      * un nouvel appel à connect().
//      */
//     disconnect() {
//         this.manuallyClosed = true;

//         if (this.reconnectTimer) {
//             clearTimeout(this.reconnectTimer);
//             this.reconnectTimer = undefined;
//         }

//         const socket = this.socket;

//         // On retire immédiatement le socket courant.
//         // Ainsi, son éventuel événement "close" ne pourra
//         // pas déclencher une reconnexion.
//         this.socket = null;

//         socket?.close();

//         this.emitStatus('closed');
//     }
// }

// // Une seule instance partagée dans toute l'application.
// export const messagingSocket = new MessagingSocket();




import { env } from '$env/dynamic/public';
import type { WSEvent, WSOutgoingPayload, ConnectionStatus } from './types';

const WS_PATH = '/ws/messaging';

function resolveWsUrl(token?: string | null): string {
	const apiBaseUrl = env.PUBLIC_API_URL ?? env.PUBLIC_API_BASE_URL;

	if (!apiBaseUrl) {
		throw new Error('PUBLIC_API_URL ou PUBLIC_API_BASE_URL doit être défini');
	}

	const url = new URL(apiBaseUrl);
	const proto = url.protocol === 'https:' ? 'wss:' : 'ws:';
	let wsUrl = `${proto}//${url.host}${WS_PATH}`;

	if (token) {
		wsUrl += `?token=${encodeURIComponent(token)}`;
	}

	return wsUrl;
}

type Listener<T> = (payload: T) => void;

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;

export class MessagingSocket {
	private socket: WebSocket | null = null;
	private reconnectAttempt = 0;
	private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
	private manuallyClosed = false;
	private messageListeners = new Set<Listener<WSEvent>>();
	private statusListeners = new Set<Listener<ConnectionStatus>>();
	private token: string | null = null;
	private _status: ConnectionStatus = 'closed';

	get status(): ConnectionStatus {
		return this._status;
	}

	connect(token?: string | null) {
		if (token !== undefined) {
			this.token = token;
		}
		this.manuallyClosed = false;

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = undefined;
		}

		if (
			this.socket &&
			(this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
		) {
			return;
		}

		this.open();
	}

	private open() {
		if (this.manuallyClosed) return;

		if (
			this.socket &&
			(this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
		) {
			return;
		}

		this.emitStatus('connecting');

		const socket = new WebSocket(resolveWsUrl(this.token));
		this.socket = socket;

		socket.addEventListener('open', () => {
			if (this.socket !== socket) return;
			this.reconnectAttempt = 0;
			this.emitStatus('open');
		});

		socket.addEventListener('message', (event) => {
			if (this.socket !== socket) return;
			try {
				const payload = JSON.parse(event.data) as WSEvent;
				this.messageListeners.forEach((listener) => listener(payload));
			} catch {
				// message non JSON : ignoré
			}
		});

		socket.addEventListener('close', () => {
			if (this.socket !== socket) return;
			this.socket = null;
			this.emitStatus('closed');
			if (!this.manuallyClosed) this.scheduleReconnect();
		});

		socket.addEventListener('error', () => {
			// volontairement vide, "close" gère la reconnexion
		});
	}

	private scheduleReconnect() {
		if (this.manuallyClosed || this.reconnectTimer) return;

		const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt, RECONNECT_MAX_DELAY_MS);
		this.reconnectAttempt += 1;

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = undefined;
			if (!this.manuallyClosed) this.open();
		}, delay);
	}

	send(payload: WSOutgoingPayload) {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			throw new Error('WebSocket non connecté');
		}
		this.socket.send(JSON.stringify(payload));
	}

	onEvent(listener: Listener<WSEvent>) {
		this.messageListeners.add(listener);
		return () => this.messageListeners.delete(listener);
	}

	onStatusChange(listener: Listener<ConnectionStatus>) {
		this.statusListeners.add(listener);
		// émet immédiatement le statut courant pour qu'un composant monté
		// après coup n'affiche pas "connecting" par défaut à tort
		listener(this._status);
		return () => this.statusListeners.delete(listener);
	}

	private emitStatus(status: ConnectionStatus) {
		this._status = status;
		this.statusListeners.forEach((listener) => listener(status));
	}

	disconnect() {
		this.manuallyClosed = true;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = undefined;
		}
		const socket = this.socket;
		this.socket = null;
		socket?.close();
		this.emitStatus('closed');
	}
}

export const messagingSocket = new MessagingSocket();