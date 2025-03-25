import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios, { all } from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "YOURUSERNAME",
  host: "localhost",
  database: "YOURDATABASE",
  password: "YOURPASSWORD",
  port: 5432,
});
db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let latestReadBooks;
let booksWithReviews;
let sortOption = "id";

// homepage with all reviewed books
app.get("/", async (req,res) => {
  try{
    const result = await db.query(`SELECT * FROM read_books ORDER BY ${sortOption};`);
    booksWithReviews = result.rows;

    const latest = await db.query("SELECT * FROM public.read_books ORDER BY read_at DESC LIMIT 3");
    latestReadBooks = latest.rows;

    res.render("index.ejs", {
      booksWithReviews: booksWithReviews,
      latestReadBooks: latestReadBooks,
    });
  }catch(err){
    console.log(err);
  }
});

app.post("/sort", (req,res) => {
  sortOption = req.body.sort;
  res.redirect("/");
});

// route for showing the book which we want to review and rate
app.get("/add", (req, res) => {
  const { title, author, isbn, cover } = req.query;

  res.render("add.ejs", {
      title: title,
      author: author,
      isbn: isbn,
      cover: cover
  });
});

// route for adding the book with the review into the database
app.post("/add", async (req,res) => {
  const { title, author, review, rating, cover } = req.body;
  try {
      await db.query(
          "INSERT INTO read_books (title, author, review, rating, cover) VALUES ($1, $2, $3, $4, $5)",
          [title, author, review, rating, cover]
      );
      res.redirect("/");
  } catch (err) {
      console.error(err);
      res.status(500).send("Error adding book to database");
  }
  });


// route for showing the page for editing the books review/rating
app.get("/edit/:id", async (req,res) => {
  const bookId = req.params.id;
  try {
    const selectedBook = await db.query("SELECT * FROM read_books WHERE id = $1", [bookId]);

    if (selectedBook.rows.length > 0) {
      res.render("edit.ejs", { book: selectedBook.rows[0] }); // Pass the first book object
    } else {
      res.status(404).send("Book not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving book");
  }
});

// route for changing the books review and/or rating in the database
app.post("/edit/:id", async (req, res) => {
  const bookId = req.params.id;
  const newReview = req.body.review;
  const newRating = req.body.rating;

  try {
    await db.query(
      "UPDATE read_books SET review = $1, rating = $2 WHERE id = $3",
      [newReview, newRating, bookId]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating review and rating");
  }
});

// route for deleting the book from the database
app.post("/delete/:id", async (req,res) => {
  const bookId = req.params.id;
  try{
    await db.query("DELETE FROM read_books WHERE id = $1",[bookId]);
    res.redirect("/")
  }catch(err){
    console.log(err);
  }
});

// route for searching and showing the books from the OpenLibraryAPI
app.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);

  try {
      const response = await axios.get(`https://openlibrary.org/search.json?q=${query}&limit=5`);
      const books = response.data.docs.map(book => ({
          title: book.title,
          author: book.author_name ? book.author_name[0] : "Unknown Author",
          isbn: book.isbn ? book.isbn[0] : "N/A",
          cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : ""
      }));
      res.json(books);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch books" });
  }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  

