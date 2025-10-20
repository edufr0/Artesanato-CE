const db = require('../../config/db');

function find(filters, table) {
  let query = `SELECT * FROM ${table}`;
  if (filters && filters.where) {
    const conditions = Object.entries(filters.where)
      .map(([field, value]) => {
        // Log para depurar os filtros
        console.log(`[Base.js] Filtro: ${field} = ${value}`);
        return `${field} = '${value}'`;
      });
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
  }
  console.log(`[Base.js] Query gerada: ${query}`);
  return db.query(query);
}

const Base = {
  init({ table }) {
    if (!table) throw new Error('Invalid Params!');
    this.table = table;
    return this;
  },

  async find(id) {
    try {
      const results = await find({ where: { id } }, this.table);
      console.log(`[Base.js] find(${id}) retornou:`, results.rows);
      return this._formatPaths(results.rows[0]);
    } catch (err) {
      console.error(`[Base.js] Erro no find:`, err);
    }
  },

  async findOne(filters) {
    try {
      const results = await find(filters, this.table);
      console.log(`[Base.js] findOne com filtros ${JSON.stringify(filters)} retornou:`, results.rows);
      return this._formatPaths(results.rows[0]);
    } catch (err) {
      console.error(`[Base.js] Erro no findOne:`, err);
    }
  },

  async findAll(filters) {
    try {
      const results = await find(filters, this.table);
      console.log(`[Base.js] findAll com filtros ${JSON.stringify(filters)} retornou:`, results.rows);
      return results.rows.map(this._formatPaths);
    } catch (err) {
      console.error(`[Base.js] Erro no findAll:`, err);
    }
  },

  async findOneWithDeleted(filters) {
    try {
      const results = await find(filters, `${this.table}_with_deleted`);
      console.log(`[Base.js] findOneWithDeleted com filtros ${JSON.stringify(filters)} retornou:`, results.rows);
      return this._formatPaths(results.rows[0]);
    } catch (err) {
      console.error(`[Base.js] Erro no findOneWithDeleted:`, err);
    }
  },

  async create(fields) {
    try {
      let keys = [], values = [];
      Object.keys(fields).forEach(key => {
        let value = fields[key];
        if (typeof value === 'string' && value.includes('\\')) {
          value = value.replace(/\\/g, '/');
        }
        keys.push(key);
        values.push(`'${value}'`);
      });
      const query = `
        INSERT INTO ${this.table} (${keys.join(',')})
        VALUES (${values.join(',')})
        RETURNING id
      `;
      console.log(`[Base.js] Query create: ${query}`);
      const results = await db.query(query);
      console.log(`[Base.js] Pedido criado com id:`, results.rows[0].id);
      return results.rows[0].id;
    } catch (err) {
      console.error(`[Base.js] Erro no create:`, err);
    }
  },

  update(id, fields) {
    try {
      let update = [];
      Object.keys(fields).forEach(key => {
        let value = fields[key];
        if (typeof value === 'string' && value.includes('\\')) {
          value = value.replace(/\\/g, '/');
        }
        update.push(`${key} = '${value}'`);
      });
      const query = `
        UPDATE ${this.table} SET
        ${update.join(',')}
        WHERE id = ${id}
      `;
      console.log(`[Base.js] Query update: ${query}`);
      return db.query(query);
    } catch (err) {
      console.error(`[Base.js] Erro no update:`, err);
    }
  },

  delete(id) {
    console.log(`[Base.js] Deletando registro com id: ${id}`);
    return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id]);
  },

  _formatPaths(item) {
    if (!item) return null;
    if (item.path && typeof item.path === 'string') {
      item.path = item.path.replace(/\\/g, '/');
    }
    return item;
  }
};

module.exports = Base;
