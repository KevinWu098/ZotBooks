"use client";

import { useState } from "react";
import { queryWebsoc, getCourseInfo, queryBN } from "./utils/query";
import loader from "../public/loader.gif";
import Image from "next/image";

const BN_CODES = {
  "I&C SCI": 459,
};

export default function Home() {
  const [studyListText, setStudyListText] = useState("");
  const [sectionCodes, setSectionCodes] = useState([]);

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
        );

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
      const courseInfo = getCourseInfo(await queryWebsoc(sectionCodes));

      console.log("Querying Barnes and Nobles...");
      const materialStatus = [];
      for (const course in courseInfo) {
        const deptCode = courseInfo[course].courseDetails.deptCode;
        const BN_CODE = BN_CODES[deptCode];
        const courseNumber = courseInfo[course].courseDetails.courseNumber;

        materialStatus.push(await queryBN(BN_CODE, courseNumber));
      }

      setLoading(false);
    } catch (error) {
      console.log("Error finding materials...");
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen justify-between font-sans items-center">
      <div className="flex justify-center align-middle items-center z-10 mx-auto w-full text-center text-lg">
        <div className="flex flex-1 flex-col gap-y-8 border-black border-r-white border-2 border-box min-w-[50vw] h-[100vh] py-32">
          <div className="flex flex-col gap-y-5 justify-center items-center">
            <h1 className="md:text-5xl text-3xl font-semibold">
              Import Study List
            </h1>
            <p className="text-base md:w-72 sm:w-60">
              Copy and paste your Study List into ZotBooks to check what
              materials {"you'll"} need
            </p>
          </div>

          <div>
            <form onSubmit={(event) => handleSubmit(event)}>
              <input
                inputMode="text"
                className="bg-black border-b-4 outline-none"
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
            className="text-black bg-white w-24 h-24 px-2 py-0 absolute top-50 left-50 rounded-full bg-cover"
          />
        ) : (
          <button
            className="text-black bg-white w-24 h-24 px-2 py-0 absolute top-50 left-50 rounded-full hover:text-green-600 hover:border-green-600 hover:border-2 transition-all text-2xl font-semibold"
            disabled={sectionCodes?.length <= 0}
            onClick={() => findMaterials()}
          >
            Submit
          </button>
        )}

        <div className="flex flex-1 flex-col min-w-[50vw] border-black border-l-white border-box border-2 h-[100vh] justify-center">
          Right Pane
        </div>
      </div>
    </main>
  );
}
