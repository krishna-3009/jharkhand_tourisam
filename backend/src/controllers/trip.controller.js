import { pool } from '../database/pool.js';

const toTrip = (row) => ({
  id: row.id,
  tripKey: row.trip_key,
  name: row.name,
  type: row.type,
  place: row.place,
  path: row.path,
  day: row.day,
  position: row.position,
});

const validateTrip = (body) => {
  const tripKey = typeof body.tripKey === 'string' ? body.tripKey.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const place = typeof body.place === 'string' ? body.place.trim() : '';
  const path = typeof body.path === 'string' ? body.path.trim() : '';
  if (!tripKey || tripKey.length > 190 || !name || name.length > 160
    || !['destination', 'attraction'].includes(type) || place.length > 160
    || !path.startsWith('/') || path.length > 255 || path.startsWith('//')) return null;
  return { tripKey, name, type, place, path };
};

export async function listTrips(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, trip_key, name, type, place, path, day, position FROM saved_trips WHERE user_id = ? ORDER BY position, id',
      [req.session.userId],
    );
    return res.json({ trips: rows.map(toTrip) });
  } catch (error) { return next(error); }
}

export async function addTrip(req, res, next) {
  const trip = validateTrip(req.body);
  if (!trip) return res.status(400).json({ error: 'Trip details are invalid.' });
  try {
    const [existing] = await pool.execute(
      'SELECT id, trip_key, name, type, place, path, day, position FROM saved_trips WHERE user_id = ? AND trip_key = ?',
      [req.session.userId, trip.tripKey],
    );
    if (existing[0]) return res.status(200).json({ trip: toTrip(existing[0]), alreadySaved: true });
    const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM saved_trips WHERE user_id = ?', [req.session.userId]);
    const position = Number(countRows[0].total);
    const [result] = await pool.execute(
      'INSERT INTO saved_trips (user_id, trip_key, name, type, place, path, day, position) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
      [req.session.userId, trip.tripKey, trip.name, trip.type, trip.place, trip.path, position],
    );
    const [rows] = await pool.execute(
      'SELECT id, trip_key, name, type, place, path, day, position FROM saved_trips WHERE id = ? AND user_id = ?',
      [result.insertId, req.session.userId],
    );
    return res.status(201).json({ trip: toTrip(rows[0]) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This place is already in your trip.' });
    return next(error);
  }
}

export async function updateTrip(req, res, next) {
  const id = Number(req.params.id);
  const { day, position } = req.body;
  if (!Number.isSafeInteger(id) || id < 1
    || (day !== undefined && (!Number.isInteger(day) || day < 1 || day > 7))
    || (position !== undefined && (!Number.isInteger(position) || position < 0 || position > 500))) {
    return res.status(400).json({ error: 'Trip update is invalid.' });
  }
  if (day === undefined && position === undefined) return res.status(400).json({ error: 'Provide a day or position to update.' });
  try {
    const [ownedRows] = await pool.execute('SELECT id FROM saved_trips WHERE id = ? AND user_id = ?', [id, req.session.userId]);
    if (!ownedRows[0]) return res.status(404).json({ error: 'Saved trip not found.' });
    await pool.execute(
      'UPDATE saved_trips SET day = COALESCE(?, day), position = COALESCE(?, position) WHERE id = ? AND user_id = ?',
      [day ?? null, position ?? null, id, req.session.userId],
    );
    const [rows] = await pool.execute(
      'SELECT id, trip_key, name, type, place, path, day, position FROM saved_trips WHERE id = ? AND user_id = ?',
      [id, req.session.userId],
    );
    return res.json({ trip: toTrip(rows[0]) });
  } catch (error) { return next(error); }
}

export async function deleteTrip(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Trip ID is invalid.' });
  try {
    const [result] = await pool.execute('DELETE FROM saved_trips WHERE id = ? AND user_id = ?', [id, req.session.userId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Saved trip not found.' });
    return res.json({ ok: true });
  } catch (error) { return next(error); }
}

export async function clearTrips(req, res, next) {
  try {
    await pool.execute('DELETE FROM saved_trips WHERE user_id = ?', [req.session.userId]);
    return res.json({ ok: true });
  } catch (error) { return next(error); }
}
