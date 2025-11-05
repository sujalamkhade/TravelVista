import aboutImg from "../assets/images/about_img.png";
import { FaExternalLinkAlt } from "react-icons/fa";

const About = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-[90%] max-w-2xl rounded-xl shadow-xl p-3 flex flex-col gap-3">
        <h1 className="text-4xl text-center font-semibold">About</h1>
        <div className="w-max flex flex-col">
          <img src={aboutImg} className="w-40 h-40" alt="Image" />
          <h1 className="text-xl font-semibold text-center">TravelVista</h1>
        </div>
        {/* <ul className="list-disc w-max mx-5">
          <li className="hover:underline hover:text-blue-600 cursor-pointer">
            <a
              className="flex items-center gap-2"
              href=""
              target="_blank"
            >
              Git-Hub <FaExternalLinkAlt />
            </a>
          </li>
          <li className="hover:underline hover:text-blue-600 cursor-pointer">
            <a
              className="flex items-center gap-2"
              href=""
              target="_blank"
            >
              LinkedIn <FaExternalLinkAlt />
            </a>
          </li>
        </ul> */}
        <p>
          Welcome to TravelVista, your ultimate platform for discovering and booking unforgettable adventures around the globe! We believe that great travel shouldn't be complicated. Our mission is to empower every traveler, from the spontaneous weekend explorer to the meticulous planner, by providing a seamless, user-friendly portal to a curated selection of travel packages. Built with the MERN stack, TravelVista combines fast, modern technology with stunning destinations, offering features like easy filtering, secure user profiles, and transparent booking processes. Start your journey with us and turn your travel dreams into your next breathtaking view.
        </p>
      </div>
    </div>
  );
};

export default About;
