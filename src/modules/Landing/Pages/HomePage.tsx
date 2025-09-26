import HeroSection from "../Components/HeroSection";
import AboutSection from "../Components/AboutSection";
//import Testimonials from "../Components/Testimonials";
import VolunteersSection from "../../Volunteers/Components/VolunteersSection";
import Donaciones from "../../Donation/Components/Donaciones";
import PublicWorkshopsPage from "../../Workshops/Components/PublicWorkshopsPage";
//import EventsNews from "../../EventsNews/Components/EventsNews";
import LocationMap from "../Components/LocationMap";
import HistoriasdeVida from "../Components/HistoriasdeVida"; 

const Home = () => {
  return (
    <>
         <HeroSection />
      <div className="max-w-7xl mx-auto pt-10 px-6">
        

        <div className="space-y-8 pt-10">
          <AboutSection />
          <Donaciones /> {/*Prioridad a Donaciones por el Sprint 0 */}
          
          {/*<EventsNews />*/}
          {/*<Testimonials />*/}
        </div>
      </div>
      <PublicWorkshopsPage /> 

      {/* Voluntariado fuera para que sea full width */}
      <VolunteersSection />

      <div className="max-w-7xl mx-auto px-6 space-y-8 pt-10">
        <HistoriasdeVida /> 
        <LocationMap />
      </div>
    </>
  );
};

export default Home;
