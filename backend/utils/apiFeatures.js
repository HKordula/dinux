class APIFeatures {
    constructor(query, queryParams) {
      this.query = query;
      this.queryParams = queryParams;
    }
  
    filter() {
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      const queryObj = { ...this.queryParams };
  
      excludedFields.forEach(el => delete queryObj[el]);
  
      const whereClauses = [];
      const values = [];
      
      Object.entries(queryObj).forEach(([key, value]) => {
        if (key.includes('.')) {
          const [table, field] = key.split('.');
          whereClauses.push(`${table}.${field} = ?`);
        } else {
          whereClauses.push(`${key} = ?`);
        }
        values.push(value);
      });
  
      if (whereClauses.length > 0) {
        this.query += ` WHERE ${whereClauses.join(' AND ')}`;
        this.values = values;
      }
  
      return this;
    }
  
    sort() {
      if (this.queryParams.sort) {
        const sortBy = this.queryParams.sort.split(',').map(field => {
          return field.startsWith('-') 
            ? `${field.slice(1)} DESC`
            : `${field} ASC`;
        }).join(', ');
        
        this.query += ` ORDER BY ${sortBy}`;
      }
      return this;
    }
  
    paginate() {
      const page = this.queryParams.page * 1 || 1;
      const limit = this.queryParams.limit * 1 || 10;
      const offset = (page - 1) * limit;
  
      this.query += ` LIMIT ? OFFSET ?`;
      this.values.push(limit, offset);
  
      return this;
    }
  
    async execute() {
      const connection = await pool.getConnection();
      try {
        const [results] = await connection.query(this.query, this.values);
        return results;
      } finally {
        connection.release();
      }
    }
  }
  
  module.exports = APIFeatures;