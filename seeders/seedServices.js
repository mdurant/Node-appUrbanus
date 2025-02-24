// seeder/seedServices.js
const Service = require('../src/models/Service');
const { generateSlug } = require('../src/utils/slugUtils');

const servicesData = [
  {
    name: "Electricistas",
    tasks: ["Instalación eléctrica", "Revisión eléctrica", "Otros trabajos eléctricos"]
  },
  {
    name: "Construcción galpón",
    tasks: ["Construir galpón metálico", "Reparar galpón existente", "Ampliar galpón"]
  },
  {
    name: "Construcción casa",
    tasks: ["Construcción completa", "Reparaciones varias", "Ampliaciones"]
  },
  {
    name: "Pisos",
    tasks: ["Instalar piso cerámico", "Instalar piso flotante", "Pulir pisos", "Cambio piso"]
  },
  {
    name: "Pisos madera",
    tasks: ["Pulir piso madera", "Barnizar piso", "Instalar piso parquet"]
  },
  {
    name: "Remodelación casa",
    tasks: ["Cambiar distribución", "Ampliaciones internas", "Cambiar ventanas", "Refuerzo estructural"]
  },
  {
    name: "Aire acondicionado",
    tasks: ["Instalación de aire acondicionado", "Mantención de aire acondicionado", "Revisión fugas"]
  },
  {
    name: "Remodelación cocina",
    tasks: ["Cambiar muebles cocina", "Instalar encimera", "Instalar campana"]
  },
  {
    name: "Decoración",
    tasks: ["Diseño interior", "Instalación de papel mural", "Deco minimalista"]
  },
  {
    name: "Pintores",
    tasks: ["Pintar interior", "Pintar exterior", "Pequeños trabajos pintura"]
  },
  {
    name: "Remodelación baño",
    tasks: ["Cambiar cerámicas", "Instalar tina", "Reparar fugas"]
  },
  {
    name: "Arquitectos",
    tasks: ["Diseño plano casa", "Regularización municipal", "Ampliaciones"]
  },
  {
    name: "Construcción piscina",
    tasks: ["Construcción hormigón", "Instalación fibra de vidrio", "Mantención piscina"]
  },
  {
    name: "Limpieza",
    tasks: ["Limpieza doméstica", "Limpieza industrial", "Limpieza de alfombras"]
  },
  {
    name: "Ingenieros",
    tasks: ["Cálculo estructural", "Memorias de cálculo", "Asesoría en obras"]
  },
  {
    name: "Jardineros",
    tasks: ["Corte de pasto", "Poda de árboles", "Diseño de jardines"]
  },
  {
    name: "Albañiles",
    tasks: ["Levantado de muros", "Revoque de paredes", "Estucos", "Pequeños arreglos"]
  },
  {
    name: "Fletes",
    tasks: ["Mudanzas completas", "Traslado objetos grandes", "Pequeños fletes"]
  },
  {
    name: "Carpinteros",
    tasks: ["Muebles a medida", "Instalación puertas", "Reparaciones menores"]
  },
  {
    name: "Carpintería aluminio",
    tasks: ["Fabricación ventanas aluminio", "Instalación ventanas termopanel", "Reparar marcos"]
  },
  {
    name: "Ascensores",
    tasks: ["Instalación ascensores", "Mantención ascensores", "Reparación emergencias"]
  },
  {
    name: "Carpintería metálica",
    tasks: ["Soldaduras varias", "Construcción rejas", "Armar estructura metálica"]
  },
  {
    name: "Energías renovables",
    tasks: ["Instalar paneles solares", "Mantención sistema fotovoltaico", "Instalación termosolar"]
  },
  {
    name: "Remodelación local comercial",
    tasks: ["Diseño de interiores", "Instalación mobiliario", "Cambio fachada"]
  },
  {
    name: "Gasfitería",
    tasks: [
      "Hacer instalación completa gasfitería",
      "Revisar instalación gasfitería",
      "Destapar cañerías",
      "Instalar calefont",
      "Instalar termo eléctrico"
    ]
  },
  {
    name: "Control de plagas",
    tasks: ["Exterminio roedores", "Control cucarachas", "Fumigación", "Desratización"]
  },
  {
    name: "Seguridad",
    tasks: ["Instalación cámaras", "Sistemas alarmas", "Control acceso"]
  },
  {
    name: "Techos",
    tasks: ["Instalar techo", "Pequeños trabajos techos", "Reparar techo"]
  },
  {
    name: "Demoliciones",
    tasks: ["Demoler muros", "Retiro escombros", "Demolición estructuras mayores"]
  },
  {
    name: "Hacer mudanza",
    tasks: ["Embalaje", "Traslado", "Desembalaje"]
  }
];

async function seedServices() {
  try {
    for (const s of servicesData) {
      const slug = generateSlug(s.name);
      await Service.create({
        name: s.name,
        slug,
        description: `${s.name} en Chile`,
        tasks: s.tasks
      });
    }
    console.log('Servicios insertados exitosamente.');
  } catch (err) {
    console.error('Error al insertar servicios:', err.message);
  } finally {
    process.exit(0);
  }
}

seedServices();
