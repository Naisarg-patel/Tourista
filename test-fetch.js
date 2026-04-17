async function test() {
    const query = '[out:json][timeout:15];(node["tourism"="attraction"](around:10000,23.0225,72.5714););out body 2;';
    try {
        let overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'User-Agent': 'TouristaApp/1.0 (+https://example.com)' },
            body: query,
            signal: AbortSignal.timeout(15000)
        });
        console.log(overpassRes.status, await overpassRes.text());
    } catch(err) {
        console.error('Overpass proxy error', err);
    }
}
test();
