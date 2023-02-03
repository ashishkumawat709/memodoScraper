const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");

app.get("/", async (req, res) => {

  const data = fs.readFileSync("scrapped.json", 'utf-8');
  res.send(data)
});

app.listen(3000, () => {
  console.log("listening");
});




// app.get("/promise", (req, res) => {
// 	axios({
// 		url: "https://stegback.com/api/asish_test_api",
// 		method: "get",
// 	})
// 		.then(response => {
// 			res.status(200).json(response.data);
// 		})
// 		.catch((err) => {
// 			res.status(500).json({ message: err });
// 		});
// });