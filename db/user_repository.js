// user_repository.js

class UserRepository {
  constructor(dao) {
    this.dao = dao
  }
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    codechef_id TEXT,
    codeforces_id TEXT,
    codechef_rating INTEGER,
    codeforces_rating INTEGER,
    rank INTEGER,
    status INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (datetime('now')))`
    return this.dao.run(sql)
  }
  create(username, codechef_id, codeforces_id) {
    return this.dao.run(
      'INSERT INTO users (username, codechef_id, codeforces_id) VALUES (?, ?, ?)',
      [username, codechef_id, codeforces_id])
  }
  update(user) {
    let sql = `UPDATE users SET `, values = []
    if(user.codechef_id != undefined) {
      sql += `codechef_id = ?,`
      values.push(user.codechef_id) 
    }
    if(user.codeforces_id != undefined) {
      sql += `codeforces_id = ?,`
      values.push(user.codeforces_id)
    }
    if(user.codechef_rating != undefined) {
      sql += `codechef_rating = ?,`
      values.push(user.codechef_rating)
    }
    if(user.codeforces_rating != undefined) {
      sql += `codeforces_rating = ?,`
      values.push(user.codeforces_rating)
    }
    if(user.rank != undefined) {
      sql += `rank = ?,`
      values.push(user.rank)
    }
    if(user.status != undefined) {
      sql += `status = ?,`
      values.push(user.status)
    }
    if(sql[sql.length-1] == ',') sql = sql.slice(0, -1)+' '
    sql += 'WHERE id = ?'
    values.push(user.id)
    return this.dao.run(sql, values)
  }
  getById(id) {
    return this.dao.get(`SELECT * FROM users WHERE id = ?`, [id])
  }
  getByUsername(username) {
    return this.dao.get(`SELECT * FROM users WHERE username = ?`, [username])
  }
  getAll() {
    return this.dao.all(`SELECT * FROM users`)
  }
  getAllActive() {
    return this.dao.all(`SELECT * FROM users WHERE status = 1`)
  }
}

module.exports = UserRepository;