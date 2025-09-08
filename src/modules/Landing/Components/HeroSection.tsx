const HeroSection = () => {
    return (
      <div className='min-h-screen w-full flex flex-col items-center justify-center pt-0'> 
        <h1 className='text-orange-600 text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide px-4 max-w-5xl'>
          Inclusión Sin Límites, Oportunidades Para Todos
        </h1>

        <p className="text-neutral-500 text-xl text-center lg:text-center py-6">
        En ASONIPED trabajamos para derribar barreras y construir un futuro accesible en Nicoya. Únete a nuestra comunidad
        </p>
  
        <div className='flex justify-center my-10 flex-wrap gap-4'> 
          <a href="/donaciones/formulario" className='bg-gradient-to-r text-white from-orange-400 to-orange-700 py-3 px-6 rounded-md text-sm hover:opacity-90 transition'>
            Apoyar la Causa
          </a>
          <a href="Conocenos" className='bg-gradient-to-r text-white from-blue-400 to-blue-700 py-3 px-6 rounded-md text-sm hover:opacity-90 transition'>
            Conocer Más
          </a>    
        </div>
      </div>
    );
  }
  
  export default HeroSection;