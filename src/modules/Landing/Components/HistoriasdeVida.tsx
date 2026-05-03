import { useEffect, useState } from 'react';
import { historiasLandingService } from '../../Dashboards/Services/historiasLandingService';

export type HistoriaDisplay = {
  nombre: string;
  historia: string;
  esVideo?: boolean;
  videoUrl?: string;
};

type HistoriasdeVidaProps = {
  title?: string;
  subtitle?: string;
  historias?: HistoriaDisplay[];
};

function HistoriasdeVidaInner({
  title,
  subtitle,
  historias = [],
}: HistoriasdeVidaProps) {
  const titleClass =
    "text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide";

  const hasContent = historias.length > 0;
  const showHeading = Boolean(title?.trim() || subtitle?.trim());

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 text-center mt-10" aria-labelledby={title ? 'historias-titulo' : undefined}>
      {!title && hasContent && <h2 className="sr-only">Testimonios</h2>}

      {showHeading && (
        <>
          {title?.trim() && (
            <h2 id="historias-titulo" className={titleClass}>
              {title.trim()}
            </h2>
          )}
          {subtitle?.trim() && (
            <p className="text-neutral-700 mb-12 max-w-3xl mx-auto">&ldquo;{subtitle.trim()}&rdquo;</p>
          )}
        </>
      )}

      {hasContent ? (
        <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide gap-4 md:gap-10 px-2 md:px-0">
          {historias.map((historia, index) => (
            <div
              key={`${historia.nombre}-${index}`}
              className="snap-center min-w-full md:min-w-[32%]"
            >
              <div className="w-full h-52 border border-gray-300 rounded-md overflow-hidden mb-3">
                {historia.esVideo && historia.videoUrl ? (
                  <iframe
                    src={historia.videoUrl}
                    title={historia.nombre}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
              </div>

              <h3 className="font-bold text-lg text-center text-gray-800 mb-2">{historia.nombre}</h3>

              <p className="text-gray-700 text-sm text-justify">{historia.historia}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-center py-8 max-w-xl mx-auto">
          No hay testimonios publicados por el momento.
        </p>
      )}
    </section>
  );
}

/** Carga testimonios desde la API; si no hay datos configurados, no muestra la sección. */
export default function HistoriasdeVida() {
  const [props, setProps] = useState<HistoriasdeVidaProps | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { header, items } = await historiasLandingService.getSection();
        if (cancelled) return;

        const historias: HistoriaDisplay[] = items.map((t) => ({
          nombre: t.name,
          historia: t.description,
          esVideo: !!t.videoUrl,
          videoUrl: t.videoUrl,
        }));

        setProps({
          title: header?.titulo,
          subtitle: header?.descripcion,
          historias,
        });
      } catch {
        if (!cancelled) setProps({ historias: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (props === null) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-10 mt-10">
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">Cargando testimonios…</div>
      </section>
    );
  }

  const hasHeader = Boolean(props.title?.trim() || props.subtitle?.trim());
  const hasItems = (props.historias?.length ?? 0) > 0;
  if (!hasHeader && !hasItems) {
    return null;
  }

  return <HistoriasdeVidaInner {...props} historias={props.historias ?? []} />;
}

export { HistoriasdeVidaInner };
