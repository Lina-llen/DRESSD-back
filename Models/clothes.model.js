import Db from '../Config/db.js';

async function getAllByUser(userId, filters = {}) {
    let sql = `
        SELECT 
            clothes.id, 
            clothes.user_id, 
            clothes.category_id, 
            categories.name AS category_name, 
            parent_categories.name AS parent_category_name,
            clothes.location_id, 
            locations.name AS location_name, 
            clothes.name, 
            clothes.image_path, 
            clothes.is_favorite,
            GROUP_CONCAT(DISTINCT tags.name ORDER BY tags.name SEPARATOR ',') AS tag_names,
            GROUP_CONCAT(DISTINCT tags.id ORDER BY tags.name SEPARATOR ',') AS tag_ids
        FROM clothes
        LEFT JOIN categories ON clothes.category_id = categories.id
        LEFT JOIN categories AS parent_categories ON categories.parent_id = parent_categories.id
        LEFT JOIN locations ON clothes.location_id = locations.id
        LEFT JOIN clothing_tags ON clothes.id = clothing_tags.clothing_id
        LEFT JOIN tags ON clothing_tags.tag_id = tags.id
        WHERE clothes.user_id = ?
    `;
    const params = [userId];

    if (filters.category_id) {
        sql += ' AND (clothes.category_id = ? OR categories.parent_id = ?)';
        params.push(filters.category_id, filters.category_id);
    }

    if (filters.location_id) {
        sql += ' AND clothes.location_id = ?';
        params.push(filters.location_id);
    }

    if (filters.is_favorite !== undefined) {
        sql += ' AND clothes.is_favorite = ?';
        params.push(filters.is_favorite === 'true' || filters.is_favorite === true || filters.is_favorite === 1 ? 1 : 0);
    }

    if (filters.tag_id) {
        sql += ' AND clothes.id IN (SELECT clothing_id FROM clothing_tags WHERE tag_id = ?)';
        params.push(filters.tag_id);
    }

    if (filters.search) {
        sql += ' AND clothes.name LIKE ?';
        params.push(`%${filters.search}%`);
    }

    sql += ' GROUP BY clothes.id ORDER BY clothes.id DESC';

    const [rows] = await Db.query(sql, params);
    
    // Formater les tags en array pour le frontend
    return rows.map(row => ({
        ...row,
        tags: row.tag_ids ? row.tag_ids.split(',').map((id, index) => ({
            id: Number(id),
            name: row.tag_names.split(',')[index]
        })) : []
    }));
}

async function getById(id, userId) {
    const [rows] = await Db.query(`
        SELECT 
            clothes.id, 
            clothes.user_id, 
            clothes.category_id, 
            categories.name AS category_name, 
            parent_categories.name AS parent_category_name,
            clothes.location_id, 
            locations.name AS location_name, 
            clothes.name, 
            clothes.image_path, 
            clothes.is_favorite
        FROM clothes
        LEFT JOIN categories ON clothes.category_id = categories.id
        LEFT JOIN categories AS parent_categories ON categories.parent_id = parent_categories.id
        LEFT JOIN locations ON clothes.location_id = locations.id
        WHERE clothes.id = ? AND clothes.user_id = ?
    `, [id, userId]);

    if (!rows[0]) return null;

    // Récupérer les tags associés
    const [tags] = await Db.query(`
        SELECT tags.id, tags.name
        FROM tags
        INNER JOIN clothing_tags ON tags.id = clothing_tags.tag_id
        WHERE clothing_tags.clothing_id = ?
    `, [id]);

    return {
        ...rows[0],
        tags
    };
}

async function insert(clothing) {
    const [result] = await Db.query(`
        INSERT INTO clothes (user_id, category_id, location_id, name, image_path, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        clothing.user_id,
        clothing.category_id,
        clothing.location_id,
        clothing.name,
        clothing.image_path,
        clothing.is_favorite ? 1 : 0
    ]);
    return result;
}

async function update(id, userId, clothing) {
    // Permet une mise à jour dynamique des champs fournis
    const fields = [];
    const params = [];

    if (clothing.name !== undefined) {
        fields.push('name = ?');
        params.push(clothing.name);
    }
    if (clothing.category_id !== undefined) {
        fields.push('category_id = ?');
        params.push(clothing.category_id);
    }
    if (clothing.location_id !== undefined) {
        fields.push('location_id = ?');
        params.push(clothing.location_id);
    }
    if (clothing.image_path !== undefined) {
        fields.push('image_path = ?');
        params.push(clothing.image_path);
    }
    if (clothing.is_favorite !== undefined) {
        fields.push('is_favorite = ?');
        params.push(clothing.is_favorite ? 1 : 0);
    }

    if (fields.length === 0) return null;

    params.push(id, userId);
    const [result] = await Db.query(`
        UPDATE clothes 
        SET ${fields.join(', ')} 
        WHERE id = ? AND user_id = ?
    `, params);

    return result;
}

async function toggleFavorite(id, userId) {
    const [result] = await Db.query(`
        UPDATE clothes 
        SET is_favorite = IF(is_favorite = 1, 0, 1) 
        WHERE id = ? AND user_id = ?
    `, [id, userId]);
    return result;
}

async function deleteClothing(id, userId) {
    const [result] = await Db.query(
        'DELETE FROM clothes WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return result;
}

export default {
    getAllByUser,
    getById,
    insert,
    update,
    toggleFavorite,
    deleteClothing
};
