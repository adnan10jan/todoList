
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

let items = ["buy food", "cook food", "eat food"];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://adnan-09:4jeAUTOhJe7nCoSC@cluster0.wuhthqt.mongodb.net/todoListDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "welcome to ur todoList!",
});

const item2 = new Item({
    name: "hit the + button to add new item"
});

const item3 = new Item({
    name: "<----- hit this to delete the item"
});


const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    Item.find({}).then(foundItems => {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        else {
            res.render("list", { listTitle: "today", newListItems: foundItems })
        }
    })
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred.");
        });
});

app.get("/:customListName", function(req, res) {
    const customListName = req.params.customListName;

    List.findOne({}).then(foundList => {

        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });

            list.save();
            res.redirect("/" + customListName);
        }
        else {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
        }
    })
        .catch(err => {
            console.error(err);
            res.status(500).send("An error occurred.");
        });
 

});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "today"){
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName })
            .then(foundList => {
                foundList.items.push(item);
                return foundList.save();
            })
            .then(() => {
                res.redirect("/" + listName);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("Error adding item to the list");
            });
    }

   
});

app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;

    try {
        await Item.findByIdAndRemove(checkedItemId);
        res.redirect("/");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while deleting the item.");
    }
});

app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems })
});





app.listen(3000, function () {
    console.log("server started on port 3000:")
}); 