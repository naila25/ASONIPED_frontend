import { TrendingUp} from "lucide-react";
import { Trophy } from "lucide-react";
import { HeartHandshake } from "lucide-react";
import { Globe } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { Heart } from "lucide-react";

import user1 from "../../assets/profile-pictures/mainUser.png";
import user2 from "../../assets/profile-pictures/mainUser.png";
import user3 from "../../assets/profile-pictures/mainUser.png";
import user4 from "../../assets/profile-pictures/mainUser.png";
import user5 from "../../assets/profile-pictures/mainUser.png";
import user6 from "../../assets/profile-pictures/mainUser.png";

export const navItems = [
  { label: "Quienes Somos", href: "/conocenos" },
  //{ label: "Voluntariado", href: "/volunteers" },
  { label: "Como ayudar", href: "/donaciones/formulario" },
  { label: "Soporte", href: "/soporte" },
 
];

export const testimonials = [
  {
    user: "María Fernández",
    company: "Madre de beneficiario",
    image: user1,
    text: "Gracias a los talleres de ASONIPED, mi hijo con discapacidad visual aprendió braille en 6 meses. Hoy lee independientemente y su autoestima ha mejorado enormemente.",
  },
  {
    user: "Ana Martínez",
    company: "Voluntaria en talleres",
    image: user2,
    text: "Colaborar en el taller de lengua de señas me permitió comprender las verdaderas necesidades de la comunidad. ASONIPED transforma vidas, ¡incluida la mía!",
  },
  {
    user: "Grupo Empresarial Guanacasteco",
    company: "Patrocinador oficial",
    image: user3,
    text: "Apoyamos a ASONIPED porque su transparencia nos muestra cómo cada colón se traduce en oportunidades reales. ¡Inversión social que marca diferencia!",
  },
  {
    user: "Comunidad de Nicoya",
    company: "Vecinos del cantón",
    image: user4,
    text: "Sus ferias de concientización han cambiado nuestra percepción sobre discapacidad. Hoy somos una comunidad más unida e inclusiva.",
  },
  {
    user: "Carlos Rojas",
    company: "Usuario de silla de ruedas",
    image: user5,
    text: "El programa de movilidad de ASONIPED me proporcionó una silla adaptada. Ahora puedo asistir a terapias y talleres sin depender de terceros.",
  },
  {
    user: "Laura Venegas",
    company: "Donante recurrente",
    image: user6,
    text: "Donar equipos de terapia ocupacional fue sencillo gracias a su plataforma. Recibo reportes mensuales del impacto de mi contribución.",
  },
];

export const features = [
  {
    icon: <TrendingUp />,
    text: "Crecimiento Sostenido",
    description:
      "60% de aumento en beneficiarios en los últimos 5 años (de 188 a 300 personas atendidas).",
  },
  {
    icon: <HeartHandshake />,
    text: "Impacto Comunitario",
    description:
      "Alianzas estratégicas con instituciones clave:",
    description2:
    "Conapdis, MEP, IMAS, CCSS, y otras organizaciones.",  
  },
  {
    icon: <Globe />,
    text: " ASONIPED Digital, la primera plataforma web de la región chorotega para:",
    description:
      "Comunicación directa con la comunidad, acceso a información, recursos y promoción de la inclusión social.",
  },
  {
    icon: <Trophy />,
    text: "Reconocimientos (27 años de trayectoria)",
    description:
      "Premios y reconocimientos por la labor social y el impacto positivo en la comunidad.",
  },
  {
    icon: <GraduationCap />,
    text: " Educación (Talleres certificados)",
    description:
      "Capacitación en habilidades prácticas y técnicas para la vida diaria.",
  },
  {
    icon: <Heart />,
    text: " Salud Mental y Física",
    description:
      "Atención integral para el bienestar de nuestros beneficiarios.",
  },
];

export const CardsOptions = [
  {
    title: "Donaciones",
    price: "Tu Apoyo Transforma Vidas",
    description: "Tu apoyo es fundamental para continuar brindando oportunidades a quienes más lo necesitan. ",
    features: [
      "Apoyo económico/material para terapias",
      "100% destinado a programas comunitarios",
      "Transparencia en el uso de fondos",
    ],
  },
  {
    title: "Talleres",
    price: "Capacitación para la Autonomía",
    description:"Talleres prácticos diseñados para potenciar habilidades y promover la independencia de nuestros beneficiarios ",
    features: [
      "Agricultura",
      "Cocina",
      "Tecnologia",
      "Arte",
    ],
  },
  {
    title: "Voluntariado",
    price: "Tu Tiempo, su Oportunidad",
    description:"Únete a nuestro equipo de voluntarios y sé parte activa del cambio social en Guanacaste",
    features: [
      "Apoyo en talleres y eventos",
      "Capacitación inicial incluida",
      "Horarios flexibles",
      "Experiencia enriquecedora",
    ],
  },
];

export const platformLinks = [
  { href: "#", text: "Correo Electronico" },
  { href: "#", text: "Telefono" },
 
];

export const communityLinks = [
  { href: "#", text: "Facebook" },
];
