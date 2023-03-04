const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "johndoe", password: "secretpassword" },
];

const isValid = (username) => {
    if (!username || typeof username !== 'string') {
      return false;
    }
    const minLength = 3;
    const maxLength = 20;
    if (username.length < minLength || username.length > maxLength) {
      return false;
    }
    if (/\s/.test(username)) {
      return false;
    }
    return true;
  };
  
    
const authenticatedUser = (username, password) => {
  // Check if the username and password are valid strings
  if (typeof username !== 'string' || typeof password !== 'string') {
    return false;
  }

  // Check if the user with the given username exists in your records
  const user = users.find((u) => u.username === username);
  if (!user) {
    return false;
  }

  // Check if the provided password matches the user's password
  if (user.password !== password) {
    return false;
  }

  // If all checks pass, the user is authenticated
  return true;
};


//only registered users can login
const jwtSecret = "sdfgt34t4tdfg54ddfgjh598393289hfb34789z";

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const user = users.find((u) => u.username === username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username }, jwtSecret);
  
    req.session.authorization = { accessToken: token };
  
    res.json({ message: "Login successful" });
  });  

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { review } = req.query;
    const isbn = req.params.isbn;
  
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
  
    const user = req.user.username;
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    let existingReview = book.reviews.find((r) => r.username === user);
  
    if (existingReview) {
      existingReview.review = review;
      return res.json({ message: "Review updated successfully" });
    }
  
    book.reviews.push({ username: user, review });
    res.json({ message: "Review added successfully" });
  });

  // Delete reviews
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
  
    // Find the book with the given ISBN
    const book = Object.values(books).find((b) => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    // Filter the reviews to only include those written by the authenticated user
    const reviewsByUser = book.reviews.filter((review) => review.username === username);
  
    // If no reviews are found, return an error
    if (reviewsByUser.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this user and book' });
    }
  
    // Remove the reviews from the book object
    book.reviews = book.reviews.filter((review) => review.username !== username);
  
    // Return the updated book object
    res.json(book);
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
