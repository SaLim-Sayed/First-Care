import React from "react";
import Navbar from '../NavBar/Navbar';
import Slides from '../Carousel/Slides';
import Footer from './../Footer/Footer';


function Chatbot() {
  return (
    <>
      <div className="bg-(--bg-color) min-h-screen transition-colors duration-300">
        <Navbar />
        <Slides />
        <Footer />
      </div>
    </>
  );
}
export default Chatbot;
