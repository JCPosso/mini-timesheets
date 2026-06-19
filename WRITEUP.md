# Writeup

## Why you, why us

Tengo mas de 4 años trabajando con Node.js, api RESTFul y next.js/Angular para el frontend.Tambien tengo experiencia desarrollando aplicativos movil para IOS/Android usando flutter y kotlin nativo. Cuento con fuerte experiencia en aplicaciones para sistemas de logistica y nómina RRHH para empresas del sector retail y transporte de mercancias a nivel nacional. He trabajado directamente con PostgreSQL optimizando queries y mejorando el rendimiento de consultas con indexacion para entornos productivos. En cuanto a CI/CD, he desarrollado pipelines con github actions ,dockerizacion y despliegue de aplicativos en la nube como AWS. Como parte del flujo de desarrollo, he participado en procesos de planeacion, diseño de arquitectura y code reviews. De la misma forma, he trabajado bajo metodologias SCRUM participando en ceremonias como sprint planing, review, daily's y retrospectives.

Actualmente, no tengo experiencia profesional con React Native, sin embargo, muchos de los conceptos trabajados en esta tecnologia como navegación, manejos de estados, consumos de apis o el manejo de ciclo de vida de los componentes son similares. Otra tecnologia de la que poseo poca experiencia es Drizzle ORM que la aprendi durante el desarrollo del assesment. 

Deseo trabajar en OCMI  porque se trabaja con Payroll y es un entorno donde es muy importante manejar detalladamente reglas de negocio que no se pueden improvisar porque cada decision puede tener impacto real en el factor humano empleado/empleador. Esto se alinea mucho con mi experiencia  en sistemas de logistica y recursos humanos donde trabaje con reglas de negocio  complejas y con datos que no se pueden perder.

## Decisions and trade-offs

### Decision 1 — SQLite over PostgreSQL
Decidí usar SQLite con better-sqlite en vez de usar PostgreSQL con Docker porque resulta mucho mas sencillo para desarrollar el assessment, es mucho mas comodo para revisar y el uso de Drizzle lo hace mucho mas portable.

### Decision 2 — Next.js App Router over Vite Router
Decidi usar Next.js con app router porque puedo usar pantallas anidadas y react server components  de manera sencilla, lo justo para la app solicitada. Rechacé Vite + React Router, Remix y TanStack Router porque no queria agregar mas tiempo a la curva de aprendizaje. Para el server state sí se usa TanStack Query.

### Decision 3 — Shared Zod
En este punto se decidio usar safeParse antes de enviar los formularios  en vez de solo validar en el api y que el cliente confie ciegamente en el servidor. Aunque aumenta el acoplamiento se obtiene una respuesta rapida sin tener que ir y volver con el api. Se maneja solo una fuente de verdad. 

### What I would do differently in production
En un entorno productivo sin duda usaria PostgreSQL porque se puede usar transacciones de base de datos mucho mas robustas y se puede hacer conexion pooling.Ademas de que sqlLite no hace buen manejo de concurrencia y tener varios usuarios corriendo nomina al mismo tiempo se volveria un grave problema.  Para el frontend, revisaria el uso adecuado de SSR o SPA y  agregaria manejo de autenticacion y roles, en cuanto al uso de un Zod compartido trataria de manejar un shared package versionado para no romper los despliegues para cuando se decida cambiar las validaciones.


## Questions

### How many years of experience do you have with React Native?
No tengo experiencia con react Native, Mi experiencia movil es con Flutter  y Kotlin Nativo en proyectos profesionales con TecnoCorp.


### Development environment
MacOS 15.4 , Apple M4, 16GB de RAM


