// rank_repository.js

class RankRepository {
  constructor(dao) {
    this.dao = dao
  }
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ranks (
    user_id INTEGER,
    rank INTEGER,
    created_at INTEGER DEFAULT (date('now')),
    PRIMARY KEY (user_id, created_at))`
    return this.dao.run(sql)
  }
  create(user_id, rank) {
    return this.dao.run(
      'INSERT INTO ranks (user_id, rank) VALUES (?, ?)',
      [user_id, rank])
  }
  getByUserId(user_id) {
    return this.dao.all(
      'SELECT rank, created_at FROM ranks WHERE user_id = ?',
      [user_id])
  }
}

module.exports = RankRepository;