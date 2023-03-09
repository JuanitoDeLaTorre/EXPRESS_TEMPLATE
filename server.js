//Important Requires of node modules and Models

const express = require("express")
const app = express()
const methodOverride = require("method-override")
const path = require("path")
const { Item } = require("./Models")
const axios = require("axios")

//Config
const PORT = 3000

//setting project parameters
app.use(express.urlencoded({ extended: false }))
app.set("views", path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.static("Public"))
app.use(methodOverride('_method'))
app.use(express.json())

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
        const allItems = await Item.find({})
        res.render("index.ejs",{allItems: allItems})
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
        res.redirect('/')
    } catch(err) {
        console.log(err)
        next()
    }
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
    console.log(`Listening on port ${PORT}!`)
})


