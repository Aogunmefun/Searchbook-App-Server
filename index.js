const express = require('express')
const env = require('dotenv').config()
const jwt = require('jsonwebtoken')
const axios = require("axios")

const app = express()

const users = []

const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"];
  
    if (!token) {
      return res.status(401).end();
    }
    try {
      const decoded = jwt.verify(token, config.TOKEN_KEY);
      req.user = decoded;
    } catch (err) {
      return res.status(401).end()
    }
    return next();
};


app.get("/", (req,res)=>{
    res.end("hello")
})

app.post("/register",(req,res)=>{
    users.push({username: req.body.username, password: req.body.password, wishlist:[]})
    res.status(200).json({res: "success"})
})

app.post("/login", (req,res)=>{
    let user = users.filter((el,index)=>el.username===req.body.username)
    if (user.length === 0) res.json({res: "no user found"})
    else if (user.password !== req.body.password) res.json({res: "bad password"})
    else {
        const token = jwt.sign(
            { username: users.username},
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
        );
        res.status(200).json({
            token: token
        })
    }
})

app.post("/getbook", verifyToken, (req,res)=>{
    axios({
        url:`https://www.googleapis.com/books/v1/volumes?q=${req.body.term}&startIndex=${req.body.start}&maxResults=10`,
        method:"GET"
      }).then((data)=>{
        res.json({data:data.data})
      }).catch((e)=>res.status(500))
})

app.post("/getwishlist", verifyToken, (req,res)=>{
    let user = users.filter((el,index)=>el.username===req.user.username)
    res.json({wishlist:user.wishlist})
})

app.post("/addwishlist", verifyToken, (req,res)=>{
    let user = users.filter((el,index)=>el.username===req.user.username)
    user.wishlist.push(req.body.item)
    users = users.map((el,index)=>{
        if (el.username===req.user.username) return user
        else return el
    })

})

app.post("/removewishlist", verifyToken, (req,res)=>{
    let user = users.filter((el,index)=>el.username===req.user.username)
    user.wishlist = user.wishlist.filter((item,index)=>req.body.item!==item)
    users = users.map((el,index)=>{
        if (el.username===req.user.username) return user
        else return el
    })
})


app.listen(3000,()=>{
    console.log("listening on port:", )
})