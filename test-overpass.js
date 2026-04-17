const query = `[out:json][timeout:25];(
node["tourism"="attraction"](around:15000,23.0215374,72.5800568);
node["amenity"="place_of_worship"](around:15000,23.0215374,72.5800568);
node["historic"="monument"](around:15000,23.0215374,72.5800568);
way["tourism"="attraction"](around:15000,23.0215374,72.5800568);
way["historic"](around:15000,23.0215374,72.5800568);
way["amenity"="place_of_worship"](around:15000,23.0215374,72.5800568);
);out center 30;`;

fetch('http://localhost:3000/api/overpass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
})
.then(r => r.json())
.then(d => {
    const count = d.elements ? d.elements.length : 0;
    console.log('Elements count:', count);
    if (count > 0) {
        console.log('First 3 POIs:');
        d.elements.slice(0, 3).forEach(e => {
            console.log(' -', e.type, '|', e.tags && e.tags.name, '|', JSON.stringify(Object.keys(e.tags || {})));
        });
    } else {
        console.log('Full response:', JSON.stringify(d, null, 2).slice(0, 500));
    }
})
.catch(e => console.error('Error:', e.message));
