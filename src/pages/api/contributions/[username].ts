import type { APIRoute } from 'astro';

export const prerender = false;

const CACHE_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 500;
const UPSTREAM_TIMEOUT_MS = 8_000;
const SUCCESS_CACHE_CONTROL = 'public, max-age=60, s-maxage=60';

interface CacheEntry {
	body: string;
	expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

function isValidUsername(username: string | undefined): username is string {
	return username !== undefined
		&& username.length > 0
		&& username.length <= 39
		&& /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(username);
}

function jsonResponse(body: unknown, status: number, cacheControl = 'no-store'): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Cache-Control': cacheControl,
			'Content-Type': 'application/json; charset=utf-8',
		},
	});
}

function getCachedResponse(username: string): string | undefined {
	const key = username.toLowerCase();
	const entry = responseCache.get(key);
	if (!entry) {
		return undefined;
	}

	if (entry.expiresAt <= Date.now()) {
		responseCache.delete(key);
		return undefined;
	}

	responseCache.delete(key);
	responseCache.set(key, entry);
	return entry.body;
}

function cacheResponse(username: string, body: string): void {
	const key = username.toLowerCase();
	responseCache.delete(key);
	responseCache.set(key, {
		body,
		expiresAt: Date.now() + CACHE_TTL_MS,
	});

	while (responseCache.size > MAX_CACHE_ENTRIES) {
		const oldestKey = responseCache.keys().next().value;
		if (oldestKey === undefined) {
			return;
		}
		responseCache.delete(oldestKey);
	}
}

function isTimeoutError(error: unknown): boolean {
	return error instanceof Error && error.name === 'TimeoutError';
}

function upstreamError(error: unknown): Response {
	if (isTimeoutError(error)) {
		return jsonResponse({ error: 'GitHub request timed out' }, 504);
	}
	return jsonResponse({ error: 'Unable to fetch GitHub contributions' }, 502);
}

export const GET: APIRoute = async ({ params }) => {
	const username = params.username;
	if (!isValidUsername(username)) {
		return jsonResponse({ error: 'Invalid GitHub username' }, 400);
	}

	const cachedBody = getCachedResponse(username);
	if (cachedBody !== undefined) {
		return new Response(cachedBody, {
			headers: {
				'Cache-Control': SUCCESS_CACHE_CONTROL,
				'Content-Type': 'application/json; charset=utf-8',
			},
		});
	}

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetch(`https://github.com/${username}.contribs`, {
			headers: { Accept: 'application/json' },
			redirect: 'error',
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
		});
	} catch (error) {
		return upstreamError(error);
	}

	if (upstreamResponse.status === 404) {
		return jsonResponse({ error: 'GitHub user not found' }, 404);
	}

	if (!upstreamResponse.ok) {
		return jsonResponse({ error: 'Unable to fetch GitHub contributions' }, 502);
	}

	let body: string;
	try {
		body = await upstreamResponse.text();
	} catch (error) {
		return upstreamError(error);
	}

	try {
		JSON.parse(body);
	} catch {
		return jsonResponse({ error: 'GitHub returned invalid contribution data' }, 502);
	}

	cacheResponse(username, body);
	return new Response(body, {
		headers: {
			'Cache-Control': SUCCESS_CACHE_CONTROL,
			'Content-Type': 'application/json; charset=utf-8',
		},
	});
};
