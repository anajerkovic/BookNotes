# Book Notes Project
## Overview
Book Notes is a simple website for adding, editing, and deleting reviews 
and ratings for books. It integrates with the OpenLibrary API to fetch book covers 
and allows users to search for books from the entire OpenLibrary database. 

## Features
- Search for books using the OpenLibrary API
- Add books and store their information in a local PostgreSQL database
- Edit and delete book reviews and ratings
- Sort books by rating, title and recency
  
## Technologies used
- **Backend:** Node.js, Express.js, PostgreSQL
- **Frontend:** HTML, CSS, JavaScript, EJS
- **API integration:** OpenLibrary API, Axios for HTTP requests

## Setup 
You  will need to setup a PostgreSQL database, and update the database connection in the project
with your own information.

```
npm i
nodemon index.js
```
