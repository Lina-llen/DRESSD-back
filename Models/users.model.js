import Db from '../Config/db.js';

async function insert(user) {
    const [result] = await Db.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [user.email, user.password]
    );
    return result;
}

async function getByEmail(email) {
    const [rows] = await Db.query(
        'SELECT id, email, password FROM users WHERE email = ?',
        [email]
    );
    return rows[0];
}

async function getById(id) {
    const [rows] = await Db.query(
        'SELECT id, email FROM users WHERE id = ?',
        [id]
    );
    return rows[0];
}

async function update(id, user) {
    const [result] = await Db.query(
        'UPDATE users SET email = ?, password = ? WHERE id = ?',
        [user.email, user.password, id]
    );
    return result;
}

async function deleteUser(id) {
    const [result] = await Db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result;
}

export default {
    insert,
    getByEmail,
    getById,
    update,
    deleteUser
};
