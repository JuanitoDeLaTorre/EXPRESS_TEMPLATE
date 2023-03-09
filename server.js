//Important Requires of node modules and Models

const express = require("express")
const app = express()
const methodOverride = require("method-override")
const path = require("path")
require("dotenv").config()
const { Item, User } = require("./Models")
const axios = require("axios")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const MongoStore = require("connect-mongo")

//Config
const PORT = 3000

//setting project parameters
app.use(express.urlencoded({ extended: false }))
app.set("views", path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.static("Public"))
app.use(methodOverride('_method'))
app.use(express.json())

app.use(
    session({
        store: MongoStore.create({mongoUrl:process.env.MONGO_DB_URI}),
        secret: "super secret",
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}
        
    })
)

//function to get unsplash urls

let unsplashResponse = []
async function getPhotos(numPhotos) {
    let imgURLs = []
    
    // try {
    //    let respObject = await axios.get("https://api.unsplash.com/photos/random?count=15&query=abstract&client_id=2xkFYCZvt9fOK2jHkVG4pEayGyEOiwxdtOvPXwfeHPI").then((resp)=>{
    //         for(let i = 0; i < resp.length; i++ ) {
    //             imgURLs.push(resp[i].urls.regular)
    //         }
    //         }
    //     )
    //     console.log(respObject.data)
    //     console.log(respObject)
    // } catch(err) {
    //     console.log(err)
        
    // }
    let res = await axios.get(`https://api.unsplash.com/photos/random?count=25&query=abstract&client_id=2xkFYCZvt9fOK2jHkVG4pEayGyEOiwxdtOvPXwfeHPI`)

    unsplashResponse = res

    return res;
}

function getReqURL(numPhotos) {
    return "https://api.unsplash.com/photos/random?count=" + numPhotos + "&query=abstract&client_id=2xkFYCZvt9fOK2jHkVG4pEayGyEOiwxdtOvPXwfeHPI"
}



app.get('/', async (req,res,next)=> {
    try {
        // console.log(req.session.currentUser.username)
        const allItems = await Item.find({})
        if(req.session.currentUser){
            return res.render('index.ejs',{allItems:allItems, user:req.session.currentUser.username})
        } else {
            return res.render("index.ejs",{allItems: allItems})
        }
    } catch (err){
        console.log(err)
        next()
    }
    
})

app.get('/new', async (req,res,next)=> {
    res.render('newItem.ejs')
})

app.post('/newItem', async (req,res,next)=> {
    try {
        console.log(req.body)
        const newItem = {
            'name': req.body.name,
            'birthday': req.body.birthday,
            'height': req.body.height,
            'stats.hp': req.body.hp,
            'stats.attack': req.body.attack,
            'stats.defense': req.body.defense,
        }
        console.log(newItem)
        const newItemInsert = await Item.create(newItem)
        res.redirect('/')
    } catch (err){
        console.log(err)
        next()
    }
})

app.get('/showItem/:name', async (req,res,next)=> {
    try {
        const showItem = await Item.findOne({ name: req.params.name })
        res.render('showItem.ejs', { item: showItem })
    } catch (err) {
        console.log(err)
        next()
    }
})

app.get('/delete/:name', async (req,res,next)=> {
    try {
        const deleteItem = await Item.findOneAndDelete({name:req.params.name})
        console.log(`Succesfully deleted ${req.params.name}!`)

        res.redirect('/')
    } catch(err) {
        console.log(err)
        next()
    }
})

app.get('/change/:name', async (req,res,next)=> {
    try {
        const changeItem = await Item.findOne({name:req.params.name})
        res.render('changeItem',{ itemToChange: changeItem})
    } catch(err) {
        console.log(err)
        next()
    }
})

app.put('/changeItem/:name', async (req,res,next)=> {
    try {
        const updateForm = {
            "name": req.body.name,
            "birthday": req.body.birthday,
            "height": req.body.height,
            "stats.hp": req.body.hp,
            "stats.attack": req.body.attack,
            "stats.defense": req.body.defense
        }
        console.log(req.body)
        console.log(req.params.name)
        // console.log(newForm)
        const updateItem = await Item.findOneAndUpdate({name:req.params.name},
             { $set: updateForm },
             {new: true}
             )
        console.log(`Succesfully updated ${req.params.name}!`)
        res.redirect('/')
    } catch(err) {
        console.log(err)
        next()
    }
})

//CREATE NEW USER ROUTES
app.get('/signUp', async (req,res,next)=> {
    res.render("signUp.ejs")
})

app.post('/newUserSubmit', async (req,res,next) => {
    try {
        const userInfo = req.body

        let salt = await bcrypt.genSalt(12)

        const hash = await bcrypt.hash(userInfo.password, salt);
        userInfo.password = hash

        const newUser = await User.create(userInfo)
        console.log(newUser)

        res.redirect('/')



    } catch(err) {
        console.log(err)
        next()
    }
})

// SIGN IN ROUTES
app.get('/login', async (req,res,next)=> {
    res.render("login.ejs")
})

app.post('/loginUser', async (req,res,next)=> {
    try {
        const loginInfo = req.body
        console.log(req.body)
        const foundUser = await User.findOne({username:loginInfo.username})

        if(!foundUser) {
            return res.redirect('/signUp')
        }

        const match = bcrypt.compare(loginInfo.password, foundUser.password)
        console.log(match)
        if(!match) return res.send("Email or password doesn't match our database.")

        req.session.currentUser = {
            id: foundUser._id,
            username: foundUser.username
        }
        res.redirect('/')

    } catch {

    }
})

app.get('/logout', (req,res,next)=> {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch(err) {
        console.log(err)
        next()
    }
})

app.get('/profile', async (req,res)=> {
    const currentUser = await User.findOne({username:req.session.currentUser.username})
    console.log(req.session.currentUser.username)
    console.log(currentUser)
    res.render('profile.ejs',{ user:currentUser })
})

app.get('/seed', async (req,res,next)=> {
    try {
        const newItems = await Item.insertMany(require('./Models/seed.js'))
        res.redirect('/')
    } catch(err)
 {
    console.log(err)
    next()
 }    
})

app.listen(PORT, async (req,res)=> {
    // console.log(session.currentUser.username)
    console.log(`Listening on port ${PORT}!`)
})


