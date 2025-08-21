import HeroSection from "../src/Components/Landing/HeroSection"
import AboutSection from "../src/Components/Landing/AboutSection" 
import Testimonials from "../src/Components/Landing/Testimonials"
import VolunteersSection from "../src/Components/Volunteers/VolunteersSection"
import Donaciones from "../src/Components/Donation/Donaciones"
//import PublicWorkshopsPage from "./Pages/Workshops/PublicWorkshopsPage"
import EventsNews from "../src/Components/Landing/EventsNews"

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto pt-10 px-6">
      <HeroSection />
      <div className="space-y-8 pt-10">
        <AboutSection />
        <Donaciones /> {/*Prioridad a Donaciones por el Sprint 0 */}
        <VolunteersSection />
        {/*<PublicWorkshopsPage />*/ } {/*Taller de voluntariado, por ahora no se implementa*/}
        <EventsNews />
        <Testimonials />
      </div>
    </div>
  );
};

export default Home;
