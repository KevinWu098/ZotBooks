const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000",
};

const app = express();
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/scrape", async (req, res) => {
  const BN_CODE = req.query.BN_CODE;
  const courseNumber = req.query.courseNumber;

  const url = new URL(
    `https://uci.bncollege.com/course-material-caching/course?campus=&term=&course=8206_1_23_F_${BN_CODE}_${courseNumber}_1&section=&oer=false`
  );

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const headline = $(".bned-description-headline");

    const headlineText = $(headline).text().replace(/\s+/g, " ").trim();

    res.status(200).send(headlineText);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error scraping the website");
  }
});
