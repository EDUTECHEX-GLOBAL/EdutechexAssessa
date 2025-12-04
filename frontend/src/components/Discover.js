import React, { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "antd";
import Draggable from "react-draggable";
import { useSelector } from "react-redux";
import GradientBackground from "../assets/gradient edit3.jpg";
import HeroImage from "../assets/assessa_banner1.png";
import RedArrow from "../assets/blue-button.svg";
import Assessalogo from "../assets/assessaai_logo2.png"; // Import the logo
import TryforFree from "../WebApp/TryforFree"; // Import the TryforFree component
import "./Discover.css";

const Discover = () => {
  const { assessaData } = useSelector((state) => state.root);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);

  if (!assessaData || !assessaData.discover || assessaData.discover.length === 0) {
    return null;
  }

  const discover = assessaData.discover[0];
  const { discoverheading, discoversubheading, tryforfreebtn, viewpricebtn } = discover;

  return (
    <motion.div id="discover" className="pt-20 lg:pt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="px-6 sm:px-10 lg:px-20 xl:px-32 text-center">
        <motion.h1 className="text-3xl sm:text-4xl font-medium lg:text-5xl xl:text-6xl lg:leading-snug" style={{ color: "#000000" }} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
          {discoverheading}
        </motion.h1>
        <motion.p className="pt-4 sm:pt-6 text-base sm:text-lg text-gray-700 lg:text-lg xl:text-xl lg:leading-7" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          {discoversubheading}
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
          {/* Try for Free - Open Modal Instead of Navigating */}
          <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-[#fb5c5c] to-[#fa3e3e] text-white w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-4 rounded-full hover:from-[#ed3333] hover:to-[#ed3333] transition duration-200 cursor-pointer">
            {tryforfreebtn}
          </button>

          <button className="text-blue-600 font-medium flex items-center justify-center gap-2 w-full sm:w-auto px-3 sm:px-6 py-1.5 sm:py-3 rounded-full border border-blue-600 hover:bg-blue-100 transition duration-200">
            <a href="#pricing">{viewpricebtn}</a>
            <span>
              <img src={RedArrow} alt="Learn More" />
            </span>
          </button>
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.div className="relative flex flex-col items-center w-full mt-6 sm:mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}>
        <div className="w-full relative">
          <img src={GradientBackground} alt="Gradient Background" className="w-full object-cover min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px]" />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            <img src={HeroImage} alt="Hero" className="hero-image max-h-[300px] sm:max-h-[350px] lg:max-h-[400px] xl:max-h-[600px] object-contain mt-0 ml-[20px]" />
            <motion.button className="hero-button" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              Generate LM Powered Assignment
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Draggable Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        modalRender={(modal) => <Draggable disabled={disabled}>{modal}</Draggable>}
      >
        {/* Render TryforFree Component Here */}
        <TryforFree />
      </Modal>
    </motion.div>
  );
};

export default Discover;
