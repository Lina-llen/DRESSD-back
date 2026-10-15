import Db from '../Config/db.js';

async function getAllByUser(userId) {
    const [rows] = await Db.query(
        'SELECT id, name FROM tags WHERE user_id = ? ORDER BY name ASC',
        [userId]
    );
    return rows;
}

async function getById(id, userId) {
    const [rows] = await Db.query(
        'SELECT id, name FROM tags WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return rows[0];
}

async function getByName(name, userId) {
    const [rows] = await Db.query(
        'SELECT id, name FROM tags WHERE name = ? AND user_id = ?',
        [name, userId]
    );
    return rows[0];
}

async function insert(tag) {
    const [result] = await Db.query(
        'INSERT INTO tags (user_id, name) VALUES (?, ?)',
        [tag.user_id, tag.name]
    );
    return result;
}

async function deleteTag(id, userId) {
    const [result] = await Db.query(
        'DELETE FROM tags WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return result;
}

async function getTagsByClothingId(clothingId) {
    const [rows] = await Db.query(`
        SELECT tags.id, tags.name
        FROM tags
        INNER JOIN clothing_tags ON tags.id = clothing_tags.tag_id
        WHERE clothing_tags.clothing_id = ?
        ORDER BY tags.name ASC
    `, [clothingId]);
    return rows;
}

async function setClothingTags(clothingId, tagIds = []) {
    // Supprime d'abord les anciennes liaisons
    await Db.query('DELETE FROM clothing_tags WHERE clothing_id = ?', [clothingId]);
    
    // Insère les nouvelles liaisons
    if (tagIds.length > 0) {
        const values = tagIds.map(tagId => [clothingId, tagId]);
        await Db.query('INSERT INTO clothing_tags (clothing_id, tag_id) VALUES ?', [values]);
    }
}

export default {
    getAllByUser,
    getById,
    getByName,
    insert,
    deleteTag,
    getTagsByClothingId,
    setClothingTags
};
