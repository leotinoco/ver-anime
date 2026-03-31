import Link from 'next/link';
import { Scale } from 'lucide-react';

export const metadata = {
  title: 'Aviso Legal y Términos - Anime Fan',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-gray-300 pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl">
        <div className="text-center mb-12 border-b border-zinc-800 pb-8">
          <Scale className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Aviso Legal y Términos de Uso</h1>
          <p className="text-zinc-400">Última actualización: Marzo 2026</p>
        </div>

        <div className="space-y-10 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Marco Operativo y Propósito del Proyecto</h2>
            <p className="mb-4">
              <strong>Anime Fan</strong> se define técnica y jurídicamente como una <strong>capa de abstracción de interfaz (UI/UX)</strong> y un motor de gestión de metadatos de carácter experimental. Este proyecto ha sido concebido bajo un marco estrictamente educativo y de investigación tecnológica.
            </p>
            <p>
              El fundamento primordial de este desarrollo radica en la implementación de una arquitectura de <strong>Middleware de Experiencia de Usuario</strong>. Su objetivo es mitigar las limitaciones funcionales detectadas en infraestructuras de terceros (como AnimeFLV), proveyendo servicios de valor agregado tales como la persistencia de estados de visualización, algoritmos de ordenamiento por calificación real y sistemas de personalización de bibliotecas digitales, características que no se encuentran integradas nativamente en la fuente original.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Ausencia de Alojamiento y Propiedad de Contenido</h2>
            <p className="mb-4">
              Declaramos expresamente que <strong>Anime Fan no almacena, no aloja, no procesa y no transmite en sus propios servidores ningún archivo de video, material protegido por derechos de autor o propiedad intelectual (PI).</strong>
            </p>
            <p>
              Toda la información consultada en esta pantalla fluye pura y exclusivamente en el lado del cliente (Navegador) a través del consumo pasivo de la <a href="https://animeflv.ahmedrangel.com/api" target="_blank" rel="noreferrer noopener" className="text-primary hover:underline font-bold">API no oficial externa de AnimeFLV</a>. Los reproductores de video incrustados ("iframes") y sus enlaces de redirección externos corresponden única y exclusivamente a servidores públicos de terceros (como MEGA o Fembed) sobre los cuales este proyecto no tiene jurisdicción ni control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Fair Use (Uso Justo) y Limitación de Responsabilidad</h2>
            <p className="mb-4">
              El desarrollo de la interfaz y su código fuente hace uso del principio de "Uso Justo" (Fair Use) para el desarrollo de software demostrativo. Al ingresar a la herramienta, el usuario acepta que <strong>Anime Fan no se hace responsable por el contenido, disponibilidad o fallos de los vínculos de terceros provistos u originados por la API original de AnimeFLV (www4.animeflv.net).</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Privacidad y Bases de Datos (Experimentales)</h2>
            <p>
              Se advierte a los usuarios test que el sistema de almacenamiento en base de datos de esta versión (MongoDB Atlas) es volátil y temporal. <strong>Anime Fan</strong> no recaba datos biométricos, financieros o información personal comercializable. Las contraseñas de las listas de seguimiento (Favorites) se encriptan como prueba técnica (Proof of Concept) en un flujo estándar de Next.js, por lo tanto el usuario no debe utilizar contraseñas sensibles propias.
            </p>
          </section>

          <div className="pt-12 text-center">
            <Link 
              href="/"
              className="inline-block bg-white text-black font-bold px-8 py-3 rounded hover:bg-zinc-200 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
