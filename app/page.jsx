"use client";

import { useState } from "react";
import { queryWebsoc, getCourseInfo } from "./utils/queryWebsoc";

export default function Home() {
  const [studyListText, setStudyListText] = useState("");
  const [sectionCodes, setSectionCodes] = useState([]);

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

  return (
    <main className="flex min-h-screen justify-between p-24 font-sans items-center">
      <div className="z-10 max-w-5xl mx-auto w-full items-center text-center align-middle text-lg flex">
        <div className="flex flex-1 flex-col gap-y-8">
          <div className="flex flex-col gap-y-4 justify-center items-center">
            <div>
              <h1 className="text-3xl">Import Study List</h1>
              <p className="text-base w-72">
                Copy and paste your Study List into ZotBooks to check what
                materials {"you'll"} need
              </p>
            </div>
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
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 max-w-xs mx-auto">
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

        <div className="flex flex-1 flex-col">Right Pane</div>
      </div>
    </main>
  );
}
