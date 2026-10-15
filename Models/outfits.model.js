import Db from '../Config/db.js';

async function getAllByUser(userId, filters = {}) {
    let sql = `
        SELECT 
            outfits.id,
            outfits.user_id,
            outfits.name,
            outfits.is_favorite
        FROM outfits
        WHERE outfits.user_id = ?
    `;
    const params = [userId];

    if (filters.is_favorite !== undefined) {
        sql += ' AND outfits.is_favorite = ?';
        params.push(filters.is_favorite === 'true' || filters.is_favorite === true || filters.is_favorite === 1 ? 1 : 0);
    }

    if (filters.search) {
        sql += ' AND outfits.name LIKE ?';
        params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY outfits.id DESC';

    const [outfits] = await Db.query(sql, params);

    // Charger les vêtements pour chaque outfit
    for (const outfit of outfits) {
        const [items] = await Db.query(`
            SELECT 
                clothes.id, 
                clothes.name, 
                clothes.image_path, 
                clothes.category_id, 
                categories.name AS category_name
            FROM clothes
            INNER JOIN outfit_items ON clothes.id = outfit_items.clothing_id
            LEFT JOIN categories ON clothes.category_id = categories.id
            WHERE outfit_items.outfit_id = ?
        `, [outfit.id]);
        outfit.clothes = items;
    }

    return outfits;
}

async function getById(id, userId) {
    const [rows] = await Db.query(
        'SELECT id, user_id, name, is_favorite FROM outfits WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (!rows[0]) return null;

    const [items] = await Db.query(`
        SELECT 
            clothes.id, 
            clothes.name, 
            clothes.image_path, 
            clothes.category_id, 
            categories.name AS category_name
        FROM clothes
        INNER JOIN outfit_items ON clothes.id = outfit_items.clothing_id
        LEFT JOIN categories ON clothes.category_id = categories.id
        WHERE outfit_items.outfit_id = ?
    `, [id]);

    return {
        ...rows[0],
        clothes: items
    };
}

async function insert(outfit, clothingIds = []) {
    const [result] = await Db.query(
        'INSERT INTO outfits (user_id, name, is_favorite) VALUES (?, ?, ?)',
        [outfit.user_id, outfit.name, outfit.is_favorite ? 1 : 0]
    );
    const outfitId = result.insertId;

    if (clothingIds.length > 0) {
        const values = clothingIds.map(cId => [outfitId, cId]);
        await Db.query('INSERT INTO outfit_items (outfit_id, clothing_id) VALUES ?', [values]);
    }

    return { insertId: outfitId };
}

async function update(id, userId, outfit, clothingIds = null) {
    if (outfit.name !== undefined || outfit.is_favorite !== undefined) {
        const fields = [];
        const params = [];

        if (outfit.name !== undefined) {
            fields.push('name = ?');
            params.push(outfit.name);
        }
        if (outfit.is_favorite !== undefined) {
            fields.push('is_favorite = ?');
            params.push(outfit.is_favorite ? 1 : 0);
        }

        params.push(id, userId);
        await Db.query(`UPDATE outfits SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, params);
    }

    // Si une nouvelle liste de vêtements est fournie, synchroniser outfit_items
    if (Array.isArray(clothingIds)) {
        await Db.query('DELETE FROM outfit_items WHERE outfit_id = ?', [id]);
        if (clothingIds.length > 0) {
            const values = clothingIds.map(cId => [id, cId]);
            await Db.query('INSERT INTO outfit_items (outfit_id, clothing_id) VALUES ?', [values]);
        }
    }

    return true;
}

async function toggleFavorite(id, userId) {
    const [result] = await Db.query(
        'UPDATE outfits SET is_favorite = IF(is_favorite = 1, 0, 1) WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return result;
}

async function deleteOutfit(id, userId) {
    const [result] = await Db.query(
        'DELETE FROM outfits WHERE id = ? AND user_id = ?',
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
    deleteOutfit
};
