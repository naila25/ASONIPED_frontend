const HeroSection = () => {
    return (
      <div className='min-h-screen w-full flex flex-col items-center justify-center pt-0'> 
        <h1 className='text-orange-700 text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide px-4 max-w-5xl'>
          Inclusión Sin Límites, 
          <span className='bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text'>
            {" "}Oportunidades Para Todos
          </span>
        </h1>
        
        <p className='mt-10 text-lg text-center text-neutral-500 max-w-4xl px-4'>
          En ASONIPED trabajamos para derribar barreras y construir un futuro accesible en Nicoya. Únete a nuestra comunidad
        </p>
  
        <div className='flex justify-center my-10 flex-wrap gap-4'> 
          <a href="Donaciones" className='bg-gradient-to-r text-white from-orange-500 to-orange-800 py-3 px-6 rounded-md'>
            Apoyar la Causa
          </a>
          <a href="Conocenos" className='py-3 px-6 border rounded-md'>
            Conocer Más
          </a>    
        </div>
      </div>
    );
  }
  
  export default HeroSection;