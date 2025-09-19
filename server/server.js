const express = require('express')
const app = express()

//  fetch user array and then display users
app.get("/api", (req, res) => {
    res.json({  "users": ["userOne", "userTwo", "userThree"]})
})


//  react by default runs 3000
app.listen(5000, () => { console.log("Server started on port 5000")})