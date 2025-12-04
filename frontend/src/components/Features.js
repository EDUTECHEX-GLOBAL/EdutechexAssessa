import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Check from "../assets/check.svg";
import Aerospace from "../assets/aerospace.jpg";
import BlueButton from "../assets/blue-button.svg";
import PinkButton from "../assets/pink-button.svg";
import GreenButton from "../assets/green-button.svg";

const buttonImages = {
  blue: BlueButton,
  pink: PinkButton,
  green: GreenButton,
};

const imageSources = ["../assets/Feature3Img.png", "../assets/Feature4Img.png"];

const Features = () => {
  const { assessaData } = useSelector((state) => state.root);

  if (!assessaData || !assessaData.features || assessaData.features.length === 0) {
    return null;
  }

  const featuresData = assessaData.features.map((feature, index) => {
    const buttonColor = index === 0 ? "text-blue-600" : index === 1 ? "text-pink-600" : "text-green-600";
    const buttonImg = index === 0 ? buttonImages.blue : index === 1 ? buttonImages.pink : buttonImages.green;
    const imgSrc = index < imageSources.length ? imageSources[index] : Aerospace;

    return { ...feature, buttonColor, buttonImg, imgSrc };
  });

  return (
    <div id="features" className="flex flex-col gap-y-8 py-8 lg:py-16 lg:gap-y-12">
      {featuresData.map((feature, index) => (
        <div
          key={index}
          className={`flex flex-col gap-x-6 ${index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
        >
          {/* Image Section */}
          <div className="relative w-full sm:w-1/2 lg:px-12">
            <img src={feature.featureImg} alt={`Feature ${index + 1}`} className="w-full object-cover" />
          </div>

          {/* Animated Text Section */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="sm:w-1/2 lg:py-8 lg:px-12"
          >
            <h3 className={`font-medium ${feature.buttonColor} lg:text-lg`}>{feature.feature}</h3>
            <h1 className="pt-4 text-2xl font-medium text-gray-900 lg:text-4xl lg:leading-none">
              {feature.featuredesc}
            </h1>
            <p className="pt-6 text-gray-700 lg:text-lg lg:leading-7">{feature.subfeature}</p>
            <ul className="flex flex-col gap-3 pt-4">
              {[feature.point1, feature.point2, feature.point3, feature.point4].map((point, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700 lg:text-lg">
                  <span><img src={Check} alt="Check" /></span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default Features;
