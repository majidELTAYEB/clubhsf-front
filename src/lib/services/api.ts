type ApiErrorBody = {
	success: false;
	error: {
		code: string;
		message: string;
		status: number;
	};
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`/api${path}`, {
		...options,
		headers: { 'Content-Type': 'application/json', ...options.headers }
	});

	if (!res.ok) {
		const text = await res.text();
		try {
			const body = JSON.parse(text) as ApiErrorBody;
			throw new Error(body.error?.message || `Erreur API: ${res.status}`);
		} catch (parseError) {
			if (parseError instanceof Error && parseError.message !== text) {
				throw parseError;
			}
			throw new Error(text || `Erreur API: ${res.status}`, { cause: parseError });
		}
	}

	return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};