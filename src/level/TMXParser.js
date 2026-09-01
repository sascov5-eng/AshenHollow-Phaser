const num = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function parseTMX(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid TMX XML');
  const map = doc.querySelector('map');
  if (!map) throw new Error('TMX map element missing');

  const result = {
    width: num(map.getAttribute('width')) * num(map.getAttribute('tilewidth')),
    height: num(map.getAttribute('height')) * num(map.getAttribute('tileheight')),
    platforms: [],
    spawn: { x: 120, y: 430 },
    enemies: [],
    exits: [],
  };

  for (const group of map.querySelectorAll('objectgroup')) {
    const groupName = group.getAttribute('name');
    for (const object of group.querySelectorAll(':scope > object')) {
      const entry = {
        className: object.getAttribute('class') || object.getAttribute('type') || '',
        x: num(object.getAttribute('x')),
        y: num(object.getAttribute('y')),
        width: num(object.getAttribute('width')),
        height: num(object.getAttribute('height')),
        properties: {},
      };
      for (const property of object.querySelectorAll(':scope > properties > property')) {
        entry.properties[property.getAttribute('name')] = property.getAttribute('value') ?? property.textContent ?? '';
      }

      if (groupName === 'Collision' && entry.className === 'platform') result.platforms.push(entry);
      else if (groupName === 'Entities' && entry.className === 'player_spawn') result.spawn = { x: entry.x, y: entry.y };
      else if (groupName === 'Entities' && entry.className === 'enemy') result.enemies.push(entry);
      else if (groupName === 'Triggers' && entry.className === 'room_exit') result.exits.push(entry);
    }
  }

  return result;
}
