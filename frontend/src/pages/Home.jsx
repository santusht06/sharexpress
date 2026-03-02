import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Hero2 from "../components/Hero2";
import HeroCard from "../components/HeroCard";
import Hero3 from "../components/Hero3";
import Hero4 from "../components/Hero4";
import StartHero from "../components/StartHero";
import Questions from "../components/Questions";

const Home = () => {
  return (
    <>
      <Hero />
      <Hero2 />
      <HeroCard />
      <Hero3 />
      <Hero4 />
      <StartHero />
      <Questions />
    </>
  );
};

export default Home;
