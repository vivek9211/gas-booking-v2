const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const con = require("./connection");

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var message = "";
var userInfo = [{
  name: "",
  email: "",
  address: "",
  mno: "",
  pincode: ""
}];

app.get("/", function(req, res) {
  res.render("home");
});
app.get("/login", function(req, res) {
  res.render("login", {message: message});
});
app.get("/logauth/login", function(req, res) {
  res.render("login");
});
app.get("/register", function(req, res) {
  res.render("register", {message: message});
});
app.get("/logauth/users", function(req, res) {
  res.render("users", {name: userInfo.name, email: userInfo.email, address: userInfo.address, mno: userInfo.mno, pincode: userInfo.pincode});
});



app.post("/register", function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  con.connect(function(error) {
    if(error) console.log(error);

    con.query("SELECT email FROM user WHERE email = ?", [email],  function(error, results) {
       if(error) console.log(error);

      //console.log(results);
      if(results.length > 0) {
        message = "";
        message = "Email Alredy Used...";
        res.redirect("register");
      } else if(password != passwordConfirm) {
        message = "";
        message = "Password not Matched...";
        res.redirect("register");
      } else {
        var sql = "INSERT INTO user (name, email, password) VALUES('"+name+"', '"+email+"', '"+password+"')";
        var sqluser = "INSERT INTO userdetail (email) VALUES('"+email+"')";
        con.query(sqluser);
        con.query(sql, function(err, result) {
          if(err) console.log(err);

          message = "";
          message = "User Registered...";
          res.redirect("register");
        });
      }
    });
  });

});

app.post("/logauth/login", function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  con.connect(function(error) {
    if(error) console.log(error);

    //var sql = "SELECT * FROM user WHERE email('"+email+"')";
    con.query("SELECT * FROM user WHERE email = ?", [email], function(err, results) {
      if(err) console.log(err);

      if(results.length > 0) {
        if(results[0].password === password) {

          var sql = "SELECT * FROM userdetail WHERE email=?";
          con.query(sql, [email], function(error, result) {
            userInfo.name = results[0].name;
            userInfo.email = results[0].email;
            userInfo.address = result[0].address;
            userInfo.mno = result[0].mno;
            userInfo.pincode = result[0].pincode;
            res.redirect("users");
          })

        } else {
          message = "";
          message = "Password incorrect!!";
          res.redirect("/login");
        }
      } else {
        message = "";
        message = "User not Registered...";
        res.redirect("/login");
      }
    });
  });
});


var updateMessage = "";
app.get("/logauth/login/update", function(req, res) {
  var name = req.query.name;
  var email = req.query.email;
  res.render("update", {name: name, email: email, message: updateMessage});
});

app.post("/logauth/login/update", function(req, res) {
  var email = req.body.email;
  var address = req.body.address;
  var mno = req.body.mno;
  var pincode = req.body.pincode;

  con.connect(function(error) {
    if(error) console.log(error);

    con.query("SELECT * FROM user WHERE email=?", [email], function(error, result) {
      if(error) console.log(error);

      if(result.length > 0) {
        var sql = "UPDATE userdetail set address=?, mno=?, pincode=? where email=?";
        con.query(sql, [address, mno, pincode, email], function(err, results) {
          if(err) console.log(err);

          updateMessage = "";
          updateMessage = "Details Updated...";
          res.redirect("/logauth/login/update");
        })
      } else {
        updateMessage = "";
        updateMessage = "Error! Try Agian...";
        res.redirect("/logauth/login/update");
      }
    });
  });
});


app.get("/logauth/users/booking", function(req, res) {
  var name = req.query.name;
  var email = req.query.email;
  res.render("booking", {name: name, email: email});
});

app.post("/logauth/users/booking", function(req, res) {
  var address = req.body.address;
  var gasid = req.body.gasid;
  var date = req.body.date;
  var capacity = req.body.capacity;
  var email = req.body.email;
  var mno = req.body.mno;

  //console.log(req.body);

  con.connect(function(error) {
    if(error) console.log(error);

    var sql = "INSERT INTO bookingdetail (address, gasid, date, capacity, email, mno) VALUES('"+address+"', '"+gasid+"', '"+date+"', '"+capacity+"', '"+email+"', '"+mno+"')";
    con.query(sql, function(err, results) {
      if(err) console.log(err);

      res.redirect("/logauth/users");
    });
  });
});


app.get("/logauth/users/myorder", function(req, res) {
  var name = req.query.name;
  var email = req.query.email;

  con.connect(function(error) {
    if(error) console.log(error);

    var sql = "SELECT * FROM bookingdetail WHERE email = ?";
    con.query(sql, [email], function(err, results) {
      if(err) console.log(err);
      console.log(results);
      res.render("myorder", {name: name, data: results});
    })
  })
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
