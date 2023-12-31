"use client";

import { useState } from "react";
import { queryWebsoc, getCourseInfo, queryBN } from "./utils/query";
import loader from "../public/loader.gif";
import Image from "next/image";
import { BN_CODES } from "./constants/constants";

export default function Home() {
  const [studyListText, setStudyListText] = useState("");
  const [sectionCodes, setSectionCodes] = useState([]);
  const [materialsStatus, setMaterialsStatus] = useState({});
  const [titles, setTitles] = useState({});

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    document.getElementById("codeInput").value = "";
    const studyListCodes = studyListText.match(/\d{5}/g);

    if (!studyListCodes) {
      console.log("Error: Empty/invalid Study List");
    } else {
      setSectionCodes((prevSectionCodes) => {
        const existingCodesSet = new Set(prevSectionCodes);
        const newCodesSet = new Set(studyListCodes);

        const mergedCodes = Array.from(
          new Set([...existingCodesSet, ...newCodesSet])
        ).sort();

        return mergedCodes;
      });
    }
  };

  const handleClick = (sectionCode) => {
    setSectionCodes(sectionCodes.filter((code) => code !== sectionCode));
  };

  //https://uci.bncollege.com/course-material-caching/course?
  // ICS: https://uci.bncollege.com/course-material-caching/course?campus=8206&term=8206_1_23_F&course=8206_1_23_F_459_139W_1&section=35860&oer=false
  const findMaterials = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (!sectionCodes) {
        console.log("Cannot submit; No codes.");
        return;
      }

      console.log("Querying Websoc...");
      const courseInfo = getCourseInfo(await queryWebsoc(sectionCodes)); // returns codes in order (low -> high)

      const titles = {};
      for (const code in sectionCodes) {
        const sectionCode = sectionCodes[code];
        if (!courseInfo[sectionCode]) {
          titles[sectionCode] = "N/A";
        } else {
          const courseTitle = courseInfo[sectionCode].courseDetails.courseTitle;
          titles[sectionCode] = courseTitle;
        }
      }

      setTitles(titles);

      console.log("Querying Barnes and Nobles...");
      const statuses = {};
      for (const code in sectionCodes) {
        const sectionCode = sectionCodes[code];
        if (!courseInfo[sectionCode]) {
          statuses[sectionCode] =
            "Error: Not a valid course code (doesn't exist)";
        } else {
          const deptCode = courseInfo[sectionCode].courseDetails.deptCode;
          const BN_CODE = BN_CODES[deptCode];
          const courseNumber =
            courseInfo[sectionCode].courseDetails.courseNumber;

          statuses[sectionCode] = await queryBN(
            BN_CODE,
            sectionCode,
            courseNumber
          );
        }
      }

      setMaterialsStatus(statuses);

      setLoading(false);
    } catch (error) {
      console.log("Error finding materials...");
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute top-0 text-4xl p-4 font-semibold text-white">
        ZotBooks 📚
      </div>
      <main className="flex min-h-screen justify-between font-sans items-center bg-gradient-to-br from-blue-600 to-yellow-400 overflow-scroll">
        <div className="flex justify-center align-middle items-center z-10 mx-auto w-full text-center text-lg">
          <div className="flex flex-1 flex-col gap-y-8 border-r-white border-r-2 border-box min-w-[50vw] h-screen py-32 ">
            <div className="flex flex-col gap-y-5 justify-center items-center">
              <h1 className="md:text-5xl text-3xl font-semibold">
                Import Study List 📝
              </h1>
              <p className="text-base md:w-72 sm:w-60">
                Copy and paste your Study List into ZotBooks to check out what
                materials {"you'll"} need
              </p>
            </div>
            <div>
              <form onSubmit={(event) => handleSubmit(event)}>
                <input
                  inputMode="text"
                  className="bg-transparent text-gray-700 border-b-4 outline-none"
                  id="codeInput"
                  placeholder="Paste here!"
                  onChange={(event) => setStudyListText(event.target.value)}
                />
              </form>
            </div>
            {sectionCodes?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <h2>{"Here's"} what we received:</h2>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3 max-w-xs mx-auto">
                  {sectionCodes.map((sectionCode) => (
                    <div
                      className="hover:bg-white hover:text-red-600 hover:cursor-pointer border-box hover:border border border-white flex justify-center items-center bg-white text-black p-[0.4rem] rounded-full w-[4rem]"
                      key={sectionCode}
                      onClick={() => handleClick(sectionCode)}
                    >
                      {sectionCode}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {loading ? (
            <Image
              src={loader}
              alt="loading gif"
              className="text-black bg-white w-24 h-24 px-2 py-0 absolute bottom-10 md:top-50 left-50 rounded-full bg-cover"
            />
          ) : (
            <button
              className={`w-24 h-24 px-2 py-0 absolute bottom-10 md:top-50 left-50 rounded-full text-2xl font-semibold hover:drop-shadow-lg ${
                sectionCodes?.length <= 0
                  ? "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 cursor-not-allowed"
                  : "bg-white border-green-600 text-black hover:text-green-600 hover:border-green-60"
              }`}
              disabled={sectionCodes?.length <= 0}
              onClick={() => findMaterials()}
            >
              Submit
            </button>
          )}
          <div className="flex flex-1 flex-col min-w-[50vw] border-l-white border-box border-l-2 h-screen py-32">
            <div className="flex flex-col gap-y-5 justify-center items-center pb-5">
              <h1 className="md:text-5xl text-3xl font-semibold">
                Course Materials 🎒
              </h1>
              {/* <p className="text-base md:w-72 sm:w-60">
                Sourced from{" "}
                <Link
                  href={"https://uci.bncollege.com/course-material/course-finder"}
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Barnes and Nobles
                </Link>
              </p> */}
            </div>
            {materialsStatus && (
              <div className="flex flex-col mx-auto gap-y-4 w-[14rem] md:w-[24rem] lg:w-[30rem] max-h-[500px] overflow-scroll drop-shadow-md">
                {sectionCodes.map((code, index) => (
                  <div
                    className={`text-black bg-white p-2 rounded-lg ${
                      materialsStatus[code]?.status == "REQUIRED"
                        ? "border-4 border-box border-red-600"
                        : ""
                    } ${
                      titles[sectionCodes[index]] == "N/A"
                        ? "border-4 border-box border-yellow-300"
                        : ""
                    }`}
                    key={sectionCodes[index]}
                  >
                    <h3 className="text-left text-xl font-semibold">
                      {`${sectionCodes[index]} - ${
                        !materialsStatus[code]
                          ? "Unsearched"
                          : titles[sectionCodes[index]] || "N/A"
                      }`}
                    </h3>
                    <p
                      className={`text-left ml-4 ${
                        materialsStatus[code]?.status == "REQUIRED"
                          ? "text-red-600"
                          : "text-black"
                      }`}
                    >
                      {`Status: ${
                        materialsStatus[code]?.status || // If searched
                        materialsStatus[code] || // If not valid course code
                        "Unsearched"
                      }`}
                    </p>
                    <p className="text-left ml-4">
                      Required Materials:{" "}
                      {materialsStatus[code]?.materials || "None"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
