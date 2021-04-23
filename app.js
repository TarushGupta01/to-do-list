//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();
mongoose.connect("mmongodb+srv://admin:welcome7@cluster0.i4oqd.mongodb.net/todoDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
const itemschema = {
  name: String
};

const Item = mongoose.model("Item", itemschema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  
  Item.find(function(err,items) {
    res.render("list", {listTitle: "Today", items: items});
  });
});

app.post("/delete", function(req, res) {
  
  const id = req.body.checkbox;
  const lname = req.body.listname;
 
  console.log(lname);

  if(lname === "Today")  {
    Item.findByIdAndRemove(id, function(err, docs) {
      if(err)  {
        console.log(err);
      }  else {
        console.log("Successfully deleted!");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: lname}, {$pull: {items: {_id: id}}}, function(err, item)  {
      if(!err)  {
        res.redirect("/"+lname);
      }  
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

const listschema = {
  name: String,
  items: [itemschema]
};

const kiwi = {
  name: "kiwi"
};
const List = mongoose.model("List", listschema);

app.get("/:topic", function(req, res) {

  const head = _.camelCase(req.params.topic);
  List.findOne({name: head}, function(err, fitem) {
    if(!err)  {
      if(!fitem) {
        const list = new List({
          name: head,
          items: []
        });
      list.save();
      res.redirect("/"+head);
    } else {
      res.render("list", { listTitle: fitem.name, items: fitem.items });
    }
    }
  });
});

app.post("/", function(req, res){

  const lname = req.body.list;
  const ite = req.body.newItem;
  const item = new Item({ name: ite });
  if(lname === "Today")  {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: lname}, function(err,fitem) {
      if(!err)  {
        fitem.items.push(item);
        fitem.save();
        res.redirect("/"+lname);
      }
    });
  }
});