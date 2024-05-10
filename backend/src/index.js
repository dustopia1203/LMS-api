require("dotenv").config();
const app = require("./app");
const db = require("./utils/db");
const cloudinary = require("cloudinary").v2;

const port = process.env.PORT || 8080;

db.connect();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});
