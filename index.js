const express = require('express')
const path = require('path')
const fs = require('fs')
const hbs = require('hbs')
const crypto = require('crypto')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
const AppDAO = require('./db/dao')
const UserRepository = require('./db/user_repository')
const RankRepository = require('./db/rank_repository')
const dao = new AppDAO('./database.sqlite3')
const userRepo = new UserRepository(dao)
const rankRepo = new RankRepository(dao)
userRepo.createTable()
rankRepo.createTable()

//define path for express config
const viewsPath = path.join(__dirname, 'templates/views')
const partialsPath = path.join(__dirname, 'templates/partials')

const app = express()
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
app.set('port', process.env.PORT || 3000)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(upload.array())

app.get('/', async (req, res) => {
    const users = await userRepo.getAllActive()
    let ranklist = []
    for(let i = 0; i < users.length; i++) {
        const user = users[i]
        ranklist.push(user)
    }
    res.render('home', {ranklist})
})
app.get('/users/:username', async (req, res) => {
    const username = req.params['username']
    const user = await userRepo.getByUsername(username)
    let history = await rankRepo.getByUserId(user.id)
    history.sort((a, b) => new Date(a.created_at) < new Date(b.created_at) ? -1 : 1)
    let data = [], labels = [], today = new Date()
    for(let day = new Date(history[0].created_at), i = 0; day.getTime() < today.getTime(); day.setDate(day.getDate()+1)) {
        if(i < history.length && day.getTime() == new Date(history[i].created_at).getTime()) {
            data.push(history[i].rank)
            i++
        } else {
            data.push(null)
        }
        labels.push(`${day.getFullYear()}-${day.getMonth()+1}-${day.getDate()}`)
    }
    user.data = data
    user.labels = labels
    res.render('user', user)
})
//admin
app.post('/admin/users/create', (req, res) => {
    if(authorize(req)) {
        const {username, codechef_id, codeforces_id} = req.body
        userRepo.create(username, codechef_id, codeforces_id)
        res.send('Created')
    } else {
        res.sendStatus(403)
    }
})
app.put('/admin/users/update', (req, res) => {
    if(authorize(req)) {
        const user = req.body
        userRepo.update(user)
        res.send('Updated')
    } else {
        res.sendStatus(403)
    }
})
app.put('/admin/users/updateranks', async (req, res) => {
    if(authorize(req)) {
        let users = await userRepo.getAllActive()
        for(let i = 0; i < users.length; i++) {
            if(users[i].codechef_rating == null) users[i].codechef_rating = 0
            if(users[i].codeforces_rating == null) users[i].codeforces_rating = 0
        }
        //codechef ranks
        users.sort((a, b) => a.codechef_rating < b.codechef_rating ? 1 : -1)
        users[0].codechef_rank = 1
        for(let i = 1; i < users.length; i++) {
            users[i].codechef_rank
            = users[i].codechef_rating == users[i-1].codechef_rating
            ? users[i-1].codechef_rank 
            : users[i-1].codechef_rank+1
        }
        console.log(users)
        //codeforces ranks
        users.sort((a, b) => a.codeforces_rating < b.codeforces_rating ? 1 : -1)
        users[0].codeforces_rank = 1
        for(let i = 1; i < users.length; i++) {
            users[i].codeforces_rank
            = users[i].codeforces_rating == users[i-1].codeforces_rating
            ? users[i-1].codeforces_rank
            : users[i-1].codeforces_rank+1 
        }
        console.log(users)
        //combined ranks
        users.sort((a, b) => (a.codechef_rank+a.codeforces_rank) < (b.codechef_rank+b.codeforces_rank) ? -1 : 1)
        if(1 != users[0].rank) {
            rankRepo.create(users[0].id, 1)
            userRepo.update({id:users[0].id, rank:1})
        }
        users[0].rank = 1
        for(let i = 1; i < users.length; i++) {
            let rank
            = (users[i].codechef_rank+users[i].codeforces_rank) == (users[i-1].codechef_rank+users[i-1].codeforces_rank)
            ? users[i-1].rank 
            : users[i-1].rank+1
            if(rank != users[i].rank) {
                rankRepo.create(users[i].id, rank)
                userRepo.update({id:users[i].id, rank})
            } 
            users[i].rank = rank
        }
        console.log(users)
        res.send('Refreshed ranks')
    } else {
        res.sendStatus(403)
    }

})
app.get('/admin/users/:username', async (req, res) => {
    const username = req.params['username']
    const user = await userRepo.getByUsername(username)
    res.send(user)
})
app.get('/admin/users', async (req, res) => {
    const users = await userRepo.getAllActive()
    res.send(users)
})
app.get('*', (req, res) => {
    res.sendStatus(404)
})
app.listen(app.get('port'), () => {
    console.log('Working http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' )
})

const adminKeyHash = fs.readFileSync('secrets/admin_key_hash', {encoding: 'ascii'})
function authorize(req) {
    const hash = crypto.createHash('sha256')
    return req.body.key != undefined && hash.update(req.body.key).digest('hex') == adminKeyHash
}