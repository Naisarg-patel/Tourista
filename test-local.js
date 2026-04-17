async function test() {
    const query = '[out:json][timeout:15];(node["tourism"="attraction"](around:10000,23.0225,72.5714););out body 2;';
    const res = await fetch('http://localhost:3000/api/overpass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    console.log(res.status, await res.text());
}
test();
