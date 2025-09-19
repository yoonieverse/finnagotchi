const express = require('express')
const app = express()

//  fetch user array and then display users
app.get("/", (req, res) => {
    res.json({body: { message: "Hello from server!" }})
})


//  react by default runs 3000
app.listen(8000, () => { console.log("Server started on port 8000")})