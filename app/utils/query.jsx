const axios = require("axios");

// Construct a request to PeterPortal with the params as a query string
export async function queryWebsoc(sectionCodes) {
  // Construct a request to PeterPortal with the params as a query string
  const url = new URL("https://api-next.peterportal.org/v1/rest/websoc");
  const searchString = new URLSearchParams(
    `sectionCodes=${sectionCodes.join(",")}`
  ).toString();

  url.search = `${searchString}&quarter=Fall&year=2023`;

  const response = await fetch(url, {
    headers: {
      Referer: "ZotBooks (ask Kevin)",
    },
  })
    .then((r) => r.json())
    .then((r) => r.payload);

  return response;
}

export function getCourseInfo(SOCObject) {
  const courseInfo = {};
  for (const school of SOCObject.schools) {
    for (const department of school.departments) {
      for (const course of department.courses) {
        for (const section of course.sections) {
          courseInfo[section.sectionCode] = {
            courseDetails: {
              deptCode: department.deptCode,
              courseNumber: course.courseNumber,
              courseTitle: course.courseTitle,
              courseComment: course.courseComment,
              prerequisiteLink: course.prerequisiteLink,
            },
            section: section,
          };
        }
      }
    }
  }
  return courseInfo;
}

const UCI_CAMPUS_CODE = "8206";
const TERM_QUARTER =
  "https://uci.bncollege.com/course-material-caching/course?campus=&term=&course=8206_1_23_F_27_200_1&section=&oer=false";

export async function queryBN(BN_CODE, sectionCode, courseNumber) {
  try {
    const response = await axios.get(
      `http://localhost:3001/scrape?BN_CODE=${BN_CODE.toString()}&sectionCode=${sectionCode.toString()}&courseNumber=${courseNumber.toString()}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return "Error: Not a valid course (Not in BN List)";
  }
}
