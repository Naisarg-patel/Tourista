async function test() {
    const query = '[out:json][timeout:15];(node["tourism"="attraction"](around:10000,23.0225,72.5714););out body 2;';
    const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'User-Agent': 'TouristaApp/1.0' },
        body: query
    });
    console.log(res.status, await res.text());
}
test();
