const express = require('express');
const { title } = require('process');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const { type } = require('os');

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Ensure this path is correct
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");


//insert an user into db 
router.post("/add", upload, async (req, res) => { // Add `async` here
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save(); // Save the user with await
        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

    
//get all users route
router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // Fetch users asynchronously
        const message = req.session.message || null; // Retrieve message from session (if it exists)

        res.render("index", {
            title: "Home Page",
            users: users, // Pass users to the EJS template
            message, // Pass message to the EJS template
        });

       // delete req.session.message; // Clear the session message after using it
    } catch (err) {
        res.json({ message: err.message });
    }
});


// router.get("/", (req, res) => {
//     const message = req.session.message || null; // Check if message exists in session
//     res.render("index", {
//         title: "Home Page",
//         message, // Pass the message to the EJS template
//     });
//     delete req.session.message; // Clear the session message after passing it
// });


router.get('/add', (req, res) => {
    res.render("add_users", {title: "Add users"});
});

//edit an user route
// Edit user route
router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const user = await User.findById(id); // Use await instead of callback
        if (!user) {
            return res.redirect('/'); // Redirect if user is not found
        }
        res.render('edit_users', {
            title: 'Edit Users',
            user: user, // Pass the user object to the template
        });
    } catch (err) {
        console.error(err);
        res.redirect('/'); // Handle errors by redirecting to the home page
    }
});


//update user route
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image); // Delete old image
        } catch (err) {
            console.error(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//delete user route
// Delete user route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const result = await User.findByIdAndDelete(id); // Use await to delete user
        if (result && result.image) { // Check if user exists and has an image
            try {
                fs.unlinkSync('./uploads/' + result.image); // Delete the image file
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!',
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});


module.exports = router;
