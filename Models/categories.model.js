import Db from '../Config/db.js';

async function getAll() {
    const [rows] = await Db.query(`
        SELECT 
            categories.id, 
            categories.name, 
            categories.parent_id, 
            parent_categories.name AS parent_name
        FROM categories
        LEFT JOIN categories AS parent_categories ON categories.parent_id = parent_categories.id
        ORDER BY categories.parent_id ASC, categories.name ASC
    `);
    return rows;
}

async function getMainCategories() {
    const [rows] = await Db.query(
        'SELECT id, name FROM categories WHERE parent_id IS NULL ORDER BY name ASC'
    );
    return rows;
}

async function getSubcategories(parentId) {
    const [rows] = await Db.query(
        'SELECT id, name, parent_id FROM categories WHERE parent_id = ? ORDER BY name ASC',
        [parentId]
    );
    return rows;
}

async function getById(id) {
    const [rows] = await Db.query(
        'SELECT id, name, parent_id FROM categories WHERE id = ?',
        [id]
    );
    return rows[0];
}

async function getTree() {
    const all = await getAll();
    const mainCategories = all.filter(c => c.parent_id === null);
    return mainCategories.map(main => ({
        ...main,
        subcategories: all.filter(c => c.parent_id === main.id)
    }));
}

export default {
    getAll,
    getMainCategories,
    getSubcategories,
    getById,
    getTree
};
