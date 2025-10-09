import { Outlet } from '@tanstack/react-router';
import NavBar from "./modules/Landing/Components/NavBar"
import Footer from "./modules/Landing/Components/Footer"


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;

