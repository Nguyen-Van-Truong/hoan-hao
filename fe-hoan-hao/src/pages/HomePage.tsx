import React from "react";
import ThreeColumnLayout from "../components/layout/ThreeColumnLayout";
import ContentColumn from "../components/layout/ContentColumn";
import RightColumn from "../components/layout/RightColumn";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ThreeColumnLayout>
        <ContentColumn />
      </ThreeColumnLayout>
    </div>
  );
};

export default HomePage;
