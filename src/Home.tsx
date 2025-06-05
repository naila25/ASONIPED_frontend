import HeroSection from "../src/Components/Landing/HeroSection"
import AboutSection from "../src/Components/Landing/AboutSection" 
import Testimonials from "../src/Components/Landing/Testimonials"
import VolunteersSection from "../src/Components/Volunteers/VolunteersSection"
import Donaciones from "../src/Components/Donation/Donaciones"
import PublicWorkshopsPage from "./Components/Workshop/PublicWorkshopsPage"
import EventsNews from "../src/Components/Landing/EventsNews"

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto pt-10 px-6">
      <HeroSection />
      <div className="space-y-8 pt-10">
        <AboutSection />
        <VolunteersSection />
        <div id="donaciones"><Donaciones /></div>
        <div id="talleres"><PublicWorkshopsPage /></div>
        <EventsNews />
        <Testimonials />
      </div>
    </div>
  );
};

export default Home;
