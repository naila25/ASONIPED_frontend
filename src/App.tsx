import { Outlet } from '@tanstack/react-router';
import NavBar from "./Components/Landing/NavBar"
import Footer from "./Components/Landing/Footer"


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

