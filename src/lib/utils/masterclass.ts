// Formate une durée en secondes -> "12:34" ou "1:02:34"
export function formatDuration(totalSeconds: number): string {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = Math.floor(totalSeconds % 60);

	if (h > 0) {
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
	return `${m}:${String(s).padStart(2, '0')}`;
}

// Additionne les durées d'une collection -> "2h 14min"
export function formatTotalDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.round((seconds % 3600) / 60);
	if (h === 0) return `${m} min`;
	if (m === 0) return `${h} h`;
	return `${h} h ${m} min`;
}

// Date relative simple, en français
export function formatRelativeDate(iso: string): string {
	const date = new Date(iso);
	const diffMs = Date.now() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) return "Aujourd'hui";
	if (diffDays === 1) return 'Hier';
	if (diffDays < 7) return `Il y a ${diffDays} j`;
	if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
	return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Dégradé déterministe à partir d'une chaîne (fallback quand pas de cover_image_url)
// Reste dans une gamme sombre/désaturée pour ne pas jurer avec le reste de l'UI.
export function gradientFromString(input: string): string {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = input.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue1 = Math.abs(hash) % 360;
	const hue2 = (hue1 + 40) % 360;
	return `linear-gradient(135deg, hsl(${hue1} 35% 18%), hsl(${hue2} 30% 10%))`;
}

// Construit l'URL d'embed Bunny Stream à partir des IDs de la vidéo
export function bunnyEmbedUrl(libraryId: string, videoId: string): string {
	return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`;
}