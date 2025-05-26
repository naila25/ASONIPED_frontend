import HeroSection from "../src/Components/Landing/HeroSection"
import AboutSection from "../src/Components/Landing/AboutSection" 
import Testimonials from "../src/Components/Landing/Testimonials"
import VolunteersSection from "../src/Components/Volunteers/VolunteersSection"
import Donaciones from "../src/Components/Donation/Donaciones"
import MostrarTalleres from "../src/Components/Workshop/MostrarTalleres"

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto pt-10 px-6">
      <HeroSection />
      <div className="max-w-7xl mx-auto pt-10 px-6">
        <AboutSection />
        <VolunteersSection />
        <div id="donaciones">
          <Donaciones />
        </div>
        <div id="talleres">
          <MostrarTalleres/>
        </div>
        <Testimonials />
      </div>
    </div>
  );
};

export default Home;
