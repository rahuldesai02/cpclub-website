// badge_repository.js

class BadgeRepository {
    constructor(dao) {
      this.dao = dao
    }
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      level INTEGER,
      description TEXT,
      image_link TEXT)`
      return this.dao.run(sql)
    }
    create(title, level, description, image_link) {
        return this.dao.run(
            'INSERT INTO badges (title, level, description, image_link) VALUES (?, ?, ?, ?)',
            [title, level, description, image_link])
    }
  }
  
  module.exports = BadgeRepository;