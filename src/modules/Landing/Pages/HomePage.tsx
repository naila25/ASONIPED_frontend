import HeroSection from "../Components/HeroSection";
import AboutSection from "../Components/AboutSection";
//import Testimonials from "../Components/Testimonials";
//import VolunteersSection from "../src/Components/Volunteers/VolunteersSection";
import Donaciones from "../../Donation/Components/Donaciones";
//import PublicWorkshopsPage from "./Pages/Workshops/PublicWorkshopsPage";
//import EventsNews from "../../EventsNews/Components/EventsNews";
import LocationMap from "../Components/LocationMap";
import HistoriasdeVida from "../Components/HistoriasdeVida"; 

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto pt-10 px-6">
      <HeroSection />
      <div className="space-y-8 pt-10">
        <AboutSection />
        <Donaciones /> {/*Prioridad a Donaciones por el Sprint 0 */}
        {/*<VolunteersSection />*/}
        {/*<PublicWorkshopsPage />*/} {/*Taller de voluntariado, por ahora no se implementa*/}
        {/*<EventsNews />*/}
        {/*<Testimonials />*/}
        
        <HistoriasdeVida /> 
        
        <LocationMap />
      </div>
    </div>
  );
};

export default Home;
