const express = require("express");
const app = express();

var path = require("path");

//app.get("/:id", function (req, res) {
//if (req.params.id == "id:m@7&676Hr") {
//res.redirect("/");

//  res.send(req.params.id);

app.use("/", express.static(__dirname + "/"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
// }
//});

// viewed at http://localhost:8080

/*
const basicAuth = require("express-basic-auth");

app.use(
  basicAuth({
    users: { admin: "aaa" },
  })
);
*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
