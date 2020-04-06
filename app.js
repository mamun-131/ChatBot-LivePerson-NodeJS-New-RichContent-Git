const express = require("express");
const app = express();

var path = require("path");

// viewed at http://localhost:8080
app.use("/", express.static(__dirname + "/"));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
