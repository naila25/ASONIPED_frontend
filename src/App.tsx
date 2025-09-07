import { Outlet } from '@tanstack/react-router';
import NavBar from "./modules/Landing/Components/NavBar"
import Footer from "./modules/Landing/Components/Footer"


function App() {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;

