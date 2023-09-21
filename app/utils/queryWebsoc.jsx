// Construct a request to PeterPortal with the params as a query string
export async function queryWebsoc(sectionCodes) {
  // Construct a request to PeterPortal with the params as a query string
  const url = new URL("https://api-next.peterportal.org/v1/rest/websoc");
  const searchString = new URLSearchParams(
    `sectionCodes=${sectionCodes.join(",")}`
  ).toString();

  url.search = `${searchString}&quarter=Fall&year=2023`;

  //The data from the API will duplicate a section if it has multiple locations.
  //I.e., if there's a Tuesday section in two different (probably adjoined) rooms,
  //courses[i].sections[j].meetings will have two entries, despite it being the same section.
  //For now, I'm correcting it with removeDuplicateMeetings, but the API should handle this

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
