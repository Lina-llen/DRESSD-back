import Db from '../Config/db.js';

async function getAllByUser(userId) {
    const [rows] = await Db.query(
        'SELECT id, name FROM locations WHERE user_id = ? ORDER BY name ASC',
        [userId]
    );
    return rows;
}

async function getById(id, userId) {
    const [rows] = await Db.query(
        'SELECT id, name FROM locations WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return rows[0];
}

async function insert(location) {
    const [result] = await Db.query(
        'INSERT INTO locations (user_id, name) VALUES (?, ?)',
        [location.user_id, location.name]
    );
    return result;
}

async function update(id, userId, location) {
    const [result] = await Db.query(
        'UPDATE locations SET name = ? WHERE id = ? AND user_id = ?',
        [location.name, id, userId]
    );
    return result;
}

async function deleteLocation(id, userId) {
    const [result] = await Db.query(
        'DELETE FROM locations WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return result;
}

export default {
    getAllByUser,
    getById,
    insert,
    update,
    deleteLocation
};
