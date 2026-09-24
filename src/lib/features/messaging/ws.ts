// import { env } from '$env/dynamic/public';
// import type { WSEvent, WSOutgoingPayload, ConnectionStatus } from './types';

// const WS_PATH = '/ws/messaging';

// function resolveWsUrl(token?: string | null): string {
// 	const apiBaseUrl = env.PUBLIC_API_URL ?? env.PUBLIC_API_BASE_URL;

// 	if (!apiBaseUrl) {
// 		throw new Error('PUBLIC_API_URL ou PUBLIC_API_BASE_URL doit être défini');
// 	}

// 	const url = new URL(apiBaseUrl);
// 	const proto = url.protocol === 'https:' ? 'wss:' : 'ws:';
// 	let wsUrl = `${proto}//${url.host}${WS_PATH}`;

// 	if (token) {
// 		wsUrl += `?token=${encodeURIComponent(token)}`;
// 	}

// 	return wsUrl;
// }

// type Listener<T> = (payload: T) => void;

// const RECONNECT_BASE_DELAY_MS = 1000;
// const RECONNECT_MAX_DELAY_MS = 15000;

// export class MessagingSocket {
// 	private socket: WebSocket | null = null;
// 	private reconnectAttempt = 0;
// 	private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
// 	private manuallyClosed = false;
// 	private messageListeners = new Set<Listener<WSEvent>>();
// 	private statusListeners = new Set<Listener<ConnectionStatus>>();
// 	private token: string | null = null;
// 	private _status: ConnectionStatus = 'closed';

// 	get status(): ConnectionStatus {
// 		return this._status;
// 	}

// 	connect(token?: string | null) {
// 		if (token !== undefined) {
// 			this.token = token;
// 		}
// 		this.manuallyClosed = false;

// 		if (this.reconnectTimer) {
// 			clearTimeout(this.reconnectTimer);
// 			this.reconnectTimer = undefined;
// 		}

// 		if (
// 			this.socket &&
// 			(this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
// 		) {
// 			return;
// 		}

// 		this.open();
// 	}

// 	private open() {
// 		if (this.manuallyClosed) return;

// 		if (
// 			this.socket &&
// 			(this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
// 		) {
// 			return;
// 		}

// 		this.emitStatus('connecting');

// 		const socket = new WebSocket(resolveWsUrl(this.token));
// 		this.socket = socket;

// 		socket.addEventListener('open', () => {
// 			if (this.socket !== socket) return;
// 			this.reconnectAttempt = 0;
// 			this.emitStatus('open');
// 		});

// 		socket.addEventListener('message', (event) => {
// 			if (this.socket !== socket) return;
// 			try {
// 				const payload = JSON.parse(event.data) as WSEvent;
// 				this.messageListeners.forEach((listener) => listener(payload));
// 			} catch {
// 				// message non JSON : ignoré
// 			}
// 		});

// 		socket.addEventListener('close', () => {
// 			if (this.socket !== socket) return;
// 			this.socket = null;
// 			this.emitStatus('closed');
// 			if (!this.manuallyClosed) this.scheduleReconnect();
// 		});

// 		socket.addEventListener('error', () => {
// 			// volontairement vide, "close" gère la reconnexion
// 		});
// 	}

// 	private scheduleReconnect() {
// 		if (this.manuallyClosed || this.reconnectTimer) return;

// 		const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt, RECONNECT_MAX_DELAY_MS);
// 		this.reconnectAttempt += 1;

// 		this.reconnectTimer = setTimeout(() => {
// 			this.reconnectTimer = undefined;
// 			if (!this.manuallyClosed) this.open();
// 		}, delay);
// 	}

// 	send(payload: WSOutgoingPayload) {
// 		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
// 			throw new Error('WebSocket non connecté');
// 		}
// 		this.socket.send(JSON.stringify(payload));
// 	}

// 	onEvent(listener: Listener<WSEvent>) {
// 		this.messageListeners.add(listener);
// 		return () => this.messageListeners.delete(listener);
// 	}

// 	onStatusChange(listener: Listener<ConnectionStatus>) {
// 		this.statusListeners.add(listener);
// 		// émet immédiatement le statut courant pour qu'un composant monté
// 		// après coup n'affiche pas "connecting" par défaut à tort
// 		listener(this._status);
// 		return () => this.statusListeners.delete(listener);
// 	}

// 	private emitStatus(status: ConnectionStatus) {
// 		this._status = status;
// 		this.statusListeners.forEach((listener) => listener(status));
// 	}

// 	disconnect() {
// 		this.manuallyClosed = true;
// 		if (this.reconnectTimer) {
// 			clearTimeout(this.reconnectTimer);
// 			this.reconnectTimer = undefined;
// 		}
// 		const socket = this.socket;
// 		this.socket = null;
// 		socket?.close();
// 		this.emitStatus('closed');
// 	}
// }

// export const messagingSocket = new MessagingSocket();


import { env } from '$env/dynamic/public';
import type { WSEvent, WSOutgoingPayload, ConnectionStatus } from './types';

const WS_PATH = '/ws/messaging';

function resolveWsUrl(token: string): string {
	const apiBaseUrl = env.PUBLIC_API_URL ?? env.PUBLIC_API_BASE_URL;

	if (!apiBaseUrl) {
		throw new Error('PUBLIC_API_URL ou PUBLIC_API_BASE_URL doit être défini');
	}

	const url = new URL(apiBaseUrl);
	const proto = url.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${proto}//${url.host}${WS_PATH}?token=${encodeURIComponent(token)}`;
}

type Listener<T> = (payload: T) => void;
type TokenProvider = () => Promise<string>;

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;

export class MessagingSocket {
	private socket: WebSocket | null = null;
	private reconnectAttempt = 0;
	private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
	private manuallyClosed = false;
	private messageListeners = new Set<Listener<WSEvent>>();
	private statusListeners = new Set<Listener<ConnectionStatus>>();
	// Fonction fournie par l'appelant, qui va chercher un token WS FRAIS à
	// chaque appel (GET /api/ws-token) — indispensable car ce token est à
	// usage unique et expire en 60s. Le réutiliser lors d'une reconnexion
	// automatique échouerait systématiquement.
	private tokenProvider: TokenProvider | null = null;
	private _status: ConnectionStatus = 'closed';
	private connecting = false;

	get status(): ConnectionStatus {
		return this._status;
	}

	/**
	 * Établit la connexion. tokenProvider doit être une fonction qui
	 * retourne une Promise<string> résolvant vers un token WS frais à
	 * chaque appel (ex: () => getWsToken().then(r => r.token)).
	 */
	connect(tokenProvider: TokenProvider) {
		this.tokenProvider = tokenProvider;
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

	private async open() {
		if (this.manuallyClosed || this.connecting || !this.tokenProvider) return;

		if (
			this.socket &&
			(this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
		) {
			return;
		}

		this.connecting = true;
		this.emitStatus('connecting');

		let token: string;
		try {
			token = await this.tokenProvider();
		} catch {
			this.connecting = false;
			this.emitStatus('closed');
			if (!this.manuallyClosed) this.scheduleReconnect();
			return;
		}

		// manuallyClosed a pu changer pendant l'attente réseau du token
		if (this.manuallyClosed) {
			this.connecting = false;
			return;
		}

		const socket = new WebSocket(resolveWsUrl(token));
		this.socket = socket;

		socket.addEventListener('open', () => {
			if (this.socket !== socket) return;
			this.connecting = false;
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
			this.connecting = false;
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