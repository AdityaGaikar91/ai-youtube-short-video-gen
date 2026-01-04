import React from "react";
import VideoList from "./_components/VideoList";
import AnimeWrapper from "@/app/_components/AnimeWrapper";

function Dashboard() {
  return (
    <AnimeWrapper animation="fadeIn" duration={800}>
      <h2 className='font-bold text-3xl text-primary mb-8'>My Videos</h2>
      <VideoList/>
    </AnimeWrapper>
  );
}

export default Dashboard;
