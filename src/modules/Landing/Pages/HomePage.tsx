import HeroSection from "../Components/HeroSection";
import AboutSection from "../Components/AboutSection";
import DonationSection from "../Components/donationSection";
//import Testimonials from "../Components/Testimonials";
import VolunteersSection from "../../Volunteers/Components/VolunteersSection";
//import Donaciones from "../../Donation/Components/Donaciones";
//import PublicWorkshopsPage from "./Pages/Workshops/PublicWorkshopsPage";
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
          <DonationSection /> {/*Prioridad a Donaciones por el Sprint 0 */}
          {/*<PublicWorkshopsPage />*/} {/*Taller de voluntariado, por ahora no se implementa*/}
          {/*<EventsNews />*/}
          {/*<Testimonials />*/}
        </div>
      </div>

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
