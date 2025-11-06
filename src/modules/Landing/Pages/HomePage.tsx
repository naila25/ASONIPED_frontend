import HeroSection from "../Components/HeroSection";
import DonationSection from "../../Donation/Components/donationSection";
import AboutSection from "../Components/AboutSection";
//import Testimonials from "../Components/Testimonials";
import VolunteersSection from "../../Volunteers/Components/VolunteersSection";
import PublicWorkshopsPage from "../../Workshops/Components/PublicWorkshopsPage";
import EventsNews from "../../EventsNews/Components/EventsNews";
import LocationMap from "../Components/LocationMap";
import HistoriasdeVida from "../Components/HistoriasdeVida"; 

const Home = () => {
  return (
    <>
         <HeroSection />
         <AboutSection />
         <DonationSection /> 
          {/*<PublicWorkshopsPage />*/} 
          
          {/*<Testimonials />*/}
         <VolunteersSection />
         <PublicWorkshopsPage />
        <HistoriasdeVida /> 
        <EventsNews />

        <LocationMap />

    </>
  );
};

export default Home;
