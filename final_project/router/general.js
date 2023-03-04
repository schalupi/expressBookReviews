const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    if (users[username]) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Create new user object
    const user = { username, password };
  
    // Add user to users object
    users[username] = user;
  
    res.status(201).json({ message: "User created successfully" });
  });
  

// Get the book list available in the shop


public_users.get('/', function (req, res) {
  axios.get('https://kevinzens33-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books')
    .then((response) => {
      res.send(JSON.stringify(response.data,null,4));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Error getting books' });
    });
});




// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`https://kevinzens33-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books/${isbn}`);
    res.json(response.data);
  } catch (error) {
    if (error.response.status === 404) {
      return res.status(404).json({ message: 'Book not found' }); 
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      const response = await axios.get(`https://kevinzens33-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books?author=${author}`);
      const books = response.data;
  
      if (books.length === 0) {
        return res.status(404).json({ message: 'No books found for author' });
      }
  
      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
      const response = await axios.get(`https://kevinzens33-5000.theiadocker-2-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books/title/${title}`);
      const titleBooks = response.data;
      if (titleBooks.length === 0) {
        return res.status(404).json({ message: 'No books found for this title' });
      }
      res.json(titleBooks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find((b) => b.isbn === isbn);
  
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    const reviews = book.reviews;
    res.json(reviews);
  });
  

module.exports.general = public_users;
