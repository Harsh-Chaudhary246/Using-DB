const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));

app.set("view engine","ejs");
app.set("path", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Harsh@123',
  });

let getRandomUser= () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//HOME ROUTE
app.get("/",(req,res)=>{
  let q = "SELECT count(*) FROM user";
  try{
    connection.query(q, (err,result)=> {
      if (err) throw (err);
      let count = result[0]["count(*)"];
      res.render("home.ejs", {count});
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});


//USER ROUTE
app.get("/user", (req,res)=>{
  let qu = "SELECT * FROM user";
  try{
    connection.query(qu, (err,result)=> {
      if (err) throw (err);
      res.render("viewuser.ejs",{ result });
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});

//EDIT ROUTE 
app.get("/user/:id/edit", (req, res)=> {
  let { id } = req.params;
  let h = `SELECT * FROM user WHERE (id="${id}")`;
  try{
    connection.query(h, (err,result)=> {
      if (err) throw (err);
      let user = result[0];
      res.render("edit.ejs", {user});
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});

//UPDATE (DB) ROUTE
app.patch("/user/:id", (req,res)=> {
  let { id } = req.params;
  let {username : newUsername, password : formPass} = req.body;
  let q = `SELECT * FROM user WHERE (id="${id}")`;
  try{
    connection.query(q, (err,result)=> {
      if (err) throw (err);
      let user = result[0];
      if(formPass != user.password){
        res.send("WRONG PASSWORD");
      } else {
        let q2 = `UPDATE user SET username="${newUsername}" WHERE (id="${id}")`;
        try{
          connection.query(q2, (err,result)=> {
            if (err) throw (err);
            res.redirect("/user");
          });
        } catch (err){
          res.send("Some Error in DB");
        };

      }
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});

//ADD NEW USER 
app.get("/user/new", (req,res)=> {
  res.render("add.ejs");
});

//ADD NEW USER (DB)
app.post("/user", (req,res)=> {
  let { username : usern, email : formEmail, password : pass } = req.body;
  let user = [uuidv4(), usern, formEmail, pass];
  let q = 'INSERT INTO user(id,username,email,password) VALUES (?,?,?,?)';
  try{
    connection.query(q, user, (err,result)=> {
      if (err) throw (err);
      res.redirect("/user");
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});

//DELETE USER
app.get("/user/:id/delete", (req,res)=> {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE (id="${id}")`;
  try{
    connection.query(q, (err,result)=> {
      if (err) throw (err);
      let user = result[0];
      res.render("delete.ejs", {user});
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});

//DELETE USER (DB)
app.delete("/user/:id", (req,res)=> {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE (id="${id}")`;
  let {username: formUser, password: formPassword} = req.body;
  try{
    connection.query(q, (err,result)=> {
      if (err) throw (err);
      let user = result[0];
      if(formUser != user.username && formPassword != user.password){
        res.send("WRONG USERNAME or PASSWORD");
      } else {
        let q2 = `DELETE FROM user WHERE (id="${id}")`;
        try{
          connection.query(q2, (err,result)=> {
            if (err) throw (err);
            res.redirect("/user");
          });
        } catch (err){
          res.send("Some Error in DB");
        };
      }
    });
  } catch (err){
    res.send("Some Error in DB");
  };
});


app.listen("8080", () => {
  console.log("Server is listening at port 8080");
})