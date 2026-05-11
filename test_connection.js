const mongoose = require("mongoose");

const DB_URL = "mongodb+srv://t2p_server:gqnDphH2WGSL0LGu@t2p-db.e9jrk.mongodb.net/t2p?retryWrites=true&w=majority&appName=Cluster0&ssl=true";

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });
