const fs = require("fs");
const express = require("express");
const md5 = require("md5");
const app = express();

const port = 8080;

app.use("/static", express.static("./public/static/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get("/account/:id", (req, res) => {
  fs.stat(`./public/account/${req.params.id}`, (err, stat) => {
    if (err) res.status(404).send("Not Found");
    else fs.readFile(`./public/account/${req.params.id}/config.json`, (err, data) => {
      res.send(data.toString());
    });
  });
});

app.post("/account/:id", (req, res) => {
  fs.stat(`./public/account/${req.params.id}`, (err, stat) => {
    if (err) res.status(404).send("Not Found");
    else fs.readFile(`./public/account/${req.params.id}/config.json`, (err, data) => {
      if (err) res.status(500).send("Failed to read user/config");
      let config = JSON.parse(data.toString());
      for (const k in req.body.value) {
        if (k === "user_email") continue;
        config[k]=req.body.value[k]
      }
      fs.writeFile(`./public/account/${req.params.id}/config.json`, JSON.stringify(config), err => {
        if (err) res.status(500).send("Failed to write user/config");
        else res.sendStatus(200);
      })
    });
  });
});

app.post("/account/create", (req, res) => {
  fs.stat(`./public/account/${req.params.id}`, (err, stat) => {
    if (!err) res.status(500).send("Account Already Rigstered");
    else {
      fs.readFile(`./public/account/account.json`, (err, data) => {
        let acc = JSON.parse(data.toString());
        let user_id = ++acc.count
        acc.account_email[req.body.email] = user_id;
        fs.writeFile(`./public/account/account.json`, JSON.stringify(acc), err => {
          if (err) res.status(500).send("Failed to write account json");
        });
        fs.mkdir(`./public/account/${user_id}`, err => {
          if (err) res.status(500).send("Failed to create user folder");
          let salt = Math.ceil(100000000 * Math.random());
          fs.writeFile(`./public/account/${user_id}/config.json`, JSON.stringify({
            user_id: user_id,
            user_name: req.body.name || `Uid${user_id}`, 
            user_avatar: "https://pic4.zhimg.com/50/v2-6afa72220d29f045c15217aa6b275808_hd.jpg?source=1940ef5c", 
            user_pwd: {
              md5: md5("" + req.body.pwd + salt), 
              salt: salt
            },
            user_email: req.body.email, 
            user_readme: "",
            articles: []
          }), err => {
            if (err) res.status(500).send("Failed to write user/config");
            else res.sendStatus(200);
          });
        });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`App running at https://localhost:${port}`);
});

/*
fetch("http://localhost:8080/account/create", {
  body: `{ "name": "aaa", "age": 111 }`, 
  method: "POST", 
  headers: {
    "Content-Type": "application/json"
  }})
  .then(res=>res.text())
  .then(res=>console.log(res))
  .catch(err=>console.log(err));

fetch("http://localhost:8080/account/2", {
  body: `{ "value": {"user_name": "test_user"} }`, 
  method: "POST", 
  headers: {
    "Content-Type": "application/json"
  }})
  .then(res=>res.text())
  .then(res=>console.log(res))
  .catch(err=>console.log(err));
*/