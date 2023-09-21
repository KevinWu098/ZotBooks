import React from "react";

const CourseCard = (sectionCode) => {
  console.log(sectionCode);
  return (
    <div
      className="hover:bg-white hover:text-red-600 hover:cursor-pointer border-box hover:border border border-white flex justify-center items-center bg-white text-black p-[0.4rem] rounded-full w-[4rem]"
      onClick={() => handleClick(sectionCode)}
    >
      {sectionCode}
    </div>
  );
};

export default CourseCard;
