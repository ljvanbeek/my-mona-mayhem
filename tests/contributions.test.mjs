import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GET } from '../src/pages/api/contributions/[username].ts';

async function get(username) {
	return GET({ params: { username } });
}

test('rejects invalid usernames before making an upstream request', async (t) => {
	let fetchCalls = 0;
	t.mock.method(globalThis, 'fetch', async () => {
		fetchCalls += 1;
		throw new Error('fetch should not be called for invalid usernames');
	});

	for (const username of ['', '-name', 'name-', 'two--hyphens', 'a'.repeat(40), 'bad/name']) {
		const response = await get(username);
		assert.equal(response.status, 400, username);
		assert.deepEqual(await response.json(), { error: 'Invalid GitHub username' });
	}

	assert.equal(fetchCalls, 0);
});

test('returns and caches valid JSON using a case-insensitive username key', async (t) => {
	let fetchCalls = 0;
	t.mock.method(globalThis, 'fetch', async () => {
		fetchCalls += 1;
		return new globalThis.Response('{"contributions":[1,2]}', {
			headers: { 'Content-Type': 'application/json' },
		});
	});

	const firstResponse = await get('CacheCaseUser');
	const secondResponse = await get('cachecaseuser');

	assert.equal(firstResponse.status, 200);
	assert.equal(firstResponse.headers.get('Content-Type'), 'application/json; charset=utf-8');
	assert.equal(firstResponse.headers.get('Cache-Control'), 'public, max-age=60, s-maxage=60');
	assert.deepEqual(await firstResponse.json(), { contributions: [1, 2] });
	assert.deepEqual(await secondResponse.json(), { contributions: [1, 2] });
	assert.equal(fetchCalls, 1);
});

test('maps upstream not-found responses to 404 and does not cache them', async (t) => {
	let fetchCalls = 0;
	t.mock.method(globalThis, 'fetch', async () => {
		fetchCalls += 1;
		return new globalThis.Response(null, { status: 404 });
	});

	const firstResponse = await get('missing-contribution-user');
	const secondResponse = await get('missing-contribution-user');

	assert.equal(firstResponse.status, 404);
	assert.equal(firstResponse.headers.get('Cache-Control'), 'no-store');
	assert.deepEqual(await firstResponse.json(), { error: 'GitHub user not found' });
	assert.equal(secondResponse.status, 404);
	assert.equal(fetchCalls, 2);
});

test('maps invalid upstream JSON to 502', async (t) => {
	t.mock.method(globalThis, 'fetch', async () => new globalThis.Response('<html>not JSON</html>'));

	const response = await get('invalid-json-user');

	assert.equal(response.status, 502);
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
	assert.deepEqual(await response.json(), { error: 'GitHub returned invalid contribution data' });
});

test('maps upstream failures to a generic 502 response', async (t) => {
	t.mock.method(globalThis, 'fetch', async () => {
		throw new TypeError('internal network detail');
	});

	const response = await get('upstream-failure-user');

	assert.equal(response.status, 502);
	assert.deepEqual(await response.json(), { error: 'Unable to fetch GitHub contributions' });
});

test('maps upstream timeouts to 504', async (t) => {
	t.mock.method(globalThis, 'fetch', async () => {
		throw new globalThis.DOMException('Timed out', 'TimeoutError');
	});

	const response = await get('timed-out-user');

	assert.equal(response.status, 504);
	assert.deepEqual(await response.json(), { error: 'GitHub request timed out' });
});

test('expires successful responses after one minute', async (t) => {
	let now = 1_000_000;
	let fetchCalls = 0;
	t.mock.method(Date, 'now', () => now);
	t.mock.method(globalThis, 'fetch', async () => {
		fetchCalls += 1;
		return new globalThis.Response(JSON.stringify({ request: fetchCalls }));
	});

	await get('ttl-expiration-user');
	await get('ttl-expiration-user');
	assert.equal(fetchCalls, 1);

	now += 60_001;
	await get('ttl-expiration-user');
	assert.equal(fetchCalls, 2);
});

test('bounds the successful-response cache', async (t) => {
	let fetchCalls = 0;
	t.mock.method(globalThis, 'fetch', async () => {
		fetchCalls += 1;
		return new globalThis.Response('{}');
	});

	for (let index = 0; index < 501; index += 1) {
		await get(`cache-capacity-${index}`);
	}

	assert.equal(fetchCalls, 501);
	await get('cache-capacity-0');
	assert.equal(fetchCalls, 502);
});
