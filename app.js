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

// database connection
const dbConnection = ()=> {
  try { mongoose.connect("mongodb+srv://admin-amit:Amitbhar3@cluster0.apybtrv.mongodb.net/",{

//  try { mongoose.connect(process.env.MONGO_URL,{
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

// schema
const ItemSchema ={
  name: String
};

//schema for all the lists
const ListSchema ={
  name:  String,
  items: [ItemSchema]
};

// model 
const Item= mongoose.model("Item",ItemSchema);
const List=mongoose.model("List",ListSchema); //schema 2 for storing many lists



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



   
app.get("/", function(req, res) 
{
  //  console.log("/ root");
    //  Item.find({}, function(err,founditems){
    //    if(founditems.length === 0)
    //    { 
    //        Item.insertMany(defaultItems,(err)=>{
    //          if(err) {console.log(err);}
    //          else { console.log("successfully inserted");}
    //        });
    //    }
    //    res.render("list", {listTitle:"Today", newListItems: founditems});
    //  });
    const customListName= _.capitalize("Today");
   
    if(List.length === 0)
    {      //create a new list
          const list=new List({
            name:customListName,
            items: defaultItems
           });
           list.save();
           res.redirect("/");
    }
    else
    {
         List.findOne({name:customListName},function(err,foundList){
          if(foundList.items.length === 0) {foundList.items.push(defaultItems[0],defaultItems[1],defaultItems[2]); foundList.save();}
          res.render("list", {listTitle:foundList.name , newListItems: foundList.items});
         });
    }
    
});

app.get("/:customListName",function(req,res)
{
  const customListName= _.capitalize( req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
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
        //show an existing list
        if(foundList.items.length === 0) { foundList.items.push(defaultItems[0],defaultItems[1],defaultItems[2]); foundList.save(); }
        res.render("list", {listTitle:foundList.name , newListItems: foundList.items});
      }
    }
  })
});

app.post("/", function(req, res){

  const temp = req.body.newItem;
  const itemName= temp.slice(0, 110 );
  const listName = req.body.list;
   const item=new Item({
    name: itemName
   });
   var count=0;
   for(var i=0;i<itemName.length;i++)
   {
     if(itemName[i] != " ") {count=1; break;}
   }
   if(count==0 )  
   {
     if(listName=="Today") res.redirect("/");
     else res.redirect("/" + listName);
   }
   else if(listName === "Today"){
     List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/");
     });
   } 
   else {
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
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

    List.findOneAndUpdate({name: NameofList},{$pull:{items:{_id:CheckitemId}}},(err,foundList)=>{
      if(!err){
        res.redirect("/");
      }
    });

    // Item.findByIdAndRemove({_id:CheckitemId},function(err){
    //   if(err) console.log(err);
    //   // else console.log("successfully deleted");
    // });
    // res.redirect("/");
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


app.get("/about", function(req, res){
  res.render("about");
});



let port = process.env.PORT || 8010;


app.listen(port, ()=> {
  console.log(`Server has started successfully at ${port}`);
});
