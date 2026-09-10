export function isIOS(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isStandalone(): boolean {
	if (typeof window === 'undefined') return false;
	// iOS Safari expose navigator.standalone, les autres utilisent le media query
	return (
		(navigator as any).standalone === true ||
		window.matchMedia('(display-mode: standalone)').matches
	);
}

export function isIOSSafariVersionOK(): boolean {
	// Push notifications supportées à partir d'iOS 16.4
	const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
	if (!match) return false;
	const major = parseInt(match[1], 10);
	const minor = parseInt(match[2], 10);
	return major > 16 || (major === 16 && minor >= 4);
}

export type PushEligibility =
	| 'ready'              // peut demander la permission directement
	| 'ios-needs-install'  // iOS, doit d'abord ajouter à l'écran d'accueil
	| 'ios-too-old'        // iOS < 16.4, push impossible
	| 'unsupported';       // navigateur sans support push

export function getPushEligibility(): PushEligibility {
	const hasPushSupport = 'serviceWorker' in navigator && 'PushManager' in window;

	if (isIOS()) {
		if (!isIOSSafariVersionOK()) return 'ios-too-old';
		if (!isStandalone()) return 'ios-needs-install';
		return hasPushSupport ? 'ready' : 'unsupported';
	}

	return hasPushSupport ? 'ready' : 'unsupported';
}