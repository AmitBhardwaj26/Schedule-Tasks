 //jshint esversion:6
const path=require("path");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv'); 
dotenv.config(); 

// add the mongoose
const mongoose=require("mongoose");
// const date = require(__dirname + "/date.js");
const _ =require("lodash");

const app = express();
const static_path=path.join(__dirname,"public");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(static_path));

// const url="";
//connect with mongoose
// mongoose.connect("",{useNewUrlParser:true});

const dbConnection = ()=> {
try { mongoose.connect("process.env.MONGO_URL",{

  useNewUrlParser: true,
  // logicalSessionTimeoutMinutes: 15,
  //  useCreateIndex: true,
   useUnifiedTopology: true,
  // useFindAndModify: false,
 })
 console.log("successfully connected");
}

catch(err){
  console.log(err); };

}

dbConnection();

// .then(()=>{
//   console.log(`connectiob successful`);
// }).catch((err)=> console.log(err));

// creating schema's
const ItemSchema ={
  name: String
};
// model 
const Item= mongoose.model("Item",ItemSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1=new Item({
 name: "Welcome to your todolist"  
});  
const item2=new Item({
  name: "Hit the + button to add a new item"  
 });  
 const item3=new Item({
  name: "<-- Hit this to delete an item"  
 });  
  
 const defaultItems=[item1, item2 ,item3]; //array that can be inserted into database
 
  // Item.insertMany(defaultItems,(err)=>{
  //      if(err) console.log(err);
  //      else console.log("successfully inserted");
  //   })
   
   app.get("/", function(req, res) {
   // const day = date.getDate();
   
     Item.find({}, function(err,founditems){
       if(founditems.length === 0)
       { 
           Item.insertMany(defaultItems,(err)=>{
             if(err) {console.log(err);}
             else { console.log("successfully inserted");}
           });
       }
      
       res.render("list", {listTitle:"Today", newListItems: founditems});
     
     });
   
   });

const ListSchema ={
  name:  String,
  items: [ItemSchema]
};
const List=mongoose.model("List",ListSchema); //schema 2 for storing many lists



app.get("/:customListName",function(req,res){
  const customListName= _.capitalize( req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items: defaultItems
         });
         list.save();
         res.redirect("/" + customListName);
      }
      else
      {
        //show the list
        res.render("list", {listTitle:foundList.name , newListItems: foundList.items});
      }
    }
  }) 
  
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
   const item=new Item({
    name: itemName
   });
   
   if(listName === "Today"){
        item.save();
        res.redirect("/");
   } 
   else {
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      // res.redirect("/" + listName);
    });
   }
});

app.post("/delete",function(req,res){
  const CheckitemId= req.body.Checkbox;
   //request is made then move to its body part then Checkbox is taken from the name in list.ejs form print the value in list.ejs if not defined any value it gave 1 or 0
  const NameofList = req.body.ListName;
   //taken from the list.ejs gets the value of hidden input

  if(NameofList === "Today")
  {
    Item.findByIdAndRemove({_id:CheckitemId},function(err){
      if(err) console.log(err);
      // else console.log("successfully deleted");
    });
    res.redirect("/");
  }
  else 
  {
    List.findOneAndUpdate({name: NameofList},{$pull:{items:{_id:CheckitemId}}},(err,foundList)=>{
      if(!err){
        res.redirect("/" + NameofList);
      }
    });
  }


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/about", function(req, res){
  res.render("about");
});



let port = process.env.PORT || 8010;


app.listen(port, ()=> {
  console.log("Server has started successfully");
});
