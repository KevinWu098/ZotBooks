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

const UCI_CAMPUS_CODE = "8206";
const TERM = "8206_1_23_F";
app.get("/scrape", async (req, res) => {
  const BN_CODE = req.query.BN_CODE;
  const sectionCode = req.query.sectionCode;
  const courseNumber = req.query.courseNumber;

  const sectionURL = new URL(
    `https://uci.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_COURSE_SECTION&campus=${UCI_CAMPUS_CODE}&term=${TERM}&department=8206_1_${BN_CODE}&course=${courseNumber}&oer=false`
  );

  let sectionNumber = "";
  try {
    const response = await axios.get(sectionURL);
    sectionNumber = (
      response.data.findIndex((item) => item.code === sectionCode) + 1
    ).toString();
  } catch (error) {
    console.log("Error finding BN section number");
    console.log(error);
  }

  const url = new URL(
    `https://uci.bncollege.com/course-material-caching/course?campus=${UCI_CAMPUS_CODE}&term=${TERM}&course=${TERM}_${BN_CODE}_${courseNumber}_${sectionNumber}&section=${sectionCode}&oer=false`
  );

  console.log(url);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const materialsTextArray = $(".js-bned-item-name-text")
      .map(function () {
        return $(this).text();
      })
      .get();

    const uniqueMaterialsTextArray = [...new Set(materialsTextArray)];

    const materialsText = uniqueMaterialsTextArray.join(", ");

    const headlineText = $(".bned-description-headline")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const requiredText = $(".badge")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")[0];

    const status = requiredText ? requiredText : headlineText;

    const data = { status: status, materials: materialsText };

    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error scraping the website");
  }
});
