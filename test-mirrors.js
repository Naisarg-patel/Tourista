// Test mirrors using the CORRECT application/x-www-form-urlencoded format
const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"](around:5000,23.0215374,72.5800568););out center 10;`;

const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

async function testMirror(url) {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        const r = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'Tourista/1.0 (tourista-app)'
            },
            body: 'data=' + encodeURIComponent(query),
            signal: ctrl.signal
        });
        clearTimeout(t);
        const text = await r.text();
        if (text.trim().startsWith('<')) {
            console.log(`[${url}] -> XML ERROR (status ${r.status})`);
            return;
        }
        const data = JSON.parse(text);
        const count = data.elements ? data.elements.length : '?';
        const ts = data.osm3s ? data.osm3s.timestamp_osm_base : 'NO_TS';
        console.log(`✅ [${url}]\n   -> ${count} elements | timestamp: ${ts}`);
        if (data.elements && data.elements[0]) {
            console.log(`   -> First: ${data.elements[0].tags && data.elements[0].tags.name}`);
        }
    } catch (e) {
        console.log(`❌ [${url}] -> FAILED: ${e.message}`);
    }
}

(async () => {
    console.log('Testing mirrors with correct x-www-form-urlencoded format...\n');
    await Promise.all(mirrors.map(testMirror));
    console.log('\nDone.');
})();
