// user_badge_repository.js

class UserBadgeRepository {
  constructor(dao) {
    this.dao = dao
  }
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS user_badge (
    user_id INTEGER,
    badge_id INTEGER,
    created_at INTEGER DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, badge_id))`
    return this.dao.run(sql)
  }
  create(user_id, badge_id) {
    return this.dao.run(
      'INSERT INTO ranks (user_id, badge_id) VALUES (?, ?)',
      [user_id, badge_id])
  }
}

module.exports = UserBadgeRepository;