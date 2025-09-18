import React from "react";
import { SectionData, SectionKey } from "./types"; // Verifica ruta
import { ModalSimple } from "./ModalSimple"; // Verifica ruta

export function PreviewModal({
  sectionData,
  onClose,
}: {
  sectionData: Record<SectionKey, SectionData>;
  onClose: () => void;
}) {
  const hero = sectionData.hero || {};
  const about = sectionData.about || {};
  const volunteering = sectionData.volunteering || {};
  const location = sectionData.location || {};
  const testimonials = sectionData.testimonials || {};
  const footer = sectionData.footer || {};

  return (
    <ModalSimple onClose={onClose}>
      <div className="p-4 space-y-4 max-w-3xl overflow-auto">
        <h2 className="text-xl font-bold mb-2">Vista Previa del Landing</h2>

        {/* HERO */}
        <section className="border rounded p-3">
          <h3 className="font-semibold">Hero</h3>
          <div
            style={{
              background: hero.backgroundColor || "#f9f9f9",
              textAlign: hero.textAlign || "left",
              padding: 12,
            }}
          >
            <h4
              className="text-lg font-bold"
              style={{ color: hero.titleColor || "#000000" }}
            >
              {hero.title || "(Sin título)"}
            </h4>
            {hero.description && <p className="text-sm">{hero.description}</p>}

            {hero.videoUrl ? (
              <div className="mt-2">
                <iframe
                  title="hero-preview-video"
                  src={hero.videoUrl}
                  className="w-full h-40"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            ) : hero.image ? (
              <div className="mt-2">
                <img
                  src={hero.image}
                  alt="Hero"
                  className="max-w-full h-auto rounded"
                />
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-400">
                No hay imagen ni video
              </div>
            )}

            {hero.buttonText && hero.buttonUrl && (
              <a
                href={hero.buttonUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block mt-3 px-3 py-1 text-white rounded"
                style={{ background: hero.buttonColor || "#007bff" }}
              >
                {hero.buttonText}
              </a>
            )}
          </div>
        </section>

        {/* ABOUT */}
        <section className="border rounded p-3">
          <h3 className="font-semibold">Sobre Nosotros</h3>
          <div style={{ background: about.backgroundColor || "#fff", padding: 12 }}>
            <h4
              className="text-2xl font-bold"
              style={{ color: about.aboutTitleColor || "#000000" }}
            >
              {about.conocenosTitle || "Conócenos"}
            </h4>
            <div className="mt-3">
              <h5
                className="font-semibold"
                style={{ color: about.whatIsTitleColor || "#000000" }}
              >
                {about.whatIsTitle || ""}
              </h5>
              <p>{about.whatIsDescription || ""}</p>
            </div>
            <div className="mt-3">
              <h5
                className="font-semibold"
                style={{ color: about.whatTheyDoTitleColor || "#000000" }}
              >
                {about.whatTheyDoTitle || ""}
              </h5>
              <p>{about.whatTheyDoDescription || ""}</p>
              {about.whatTheyDoImage && (
                <img
                  src={about.whatTheyDoImage}
                  alt="Sobre Nosotros"
                  className="mt-1 max-w-full h-auto rounded"
                />
              )}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <h6
                  className="font-semibold"
                  style={{ color: about.missionTitleColor || "#000000" }}
                >
                  Propósito (Misión)
                </h6>
                <p>{about.mission || "(Sin misión)"}</p>
              </div>
              <div>
                <h6
                  className="font-semibold"
                  style={{ color: about.visionTitleColor || "#000000" }}
                >
                  Futuro (Visión)
                </h6>
                <p>{about.vision || "(Sin visión)"}</p>
              </div>
            </div>

            <div className="mt-4">
              <h6
                className="font-semibold"
                style={{ color: about.valuesTitleColor || "#000000" }}
              >
                Valores
              </h6>
              <div
                className={
                  about.valuesPosition === "grid"
                    ? "grid md:grid-cols-3 gap-3 mt-2"
                    : "space-y-2 mt-2"
                }
              >
                {(about.values || []).length > 0 ? (
                  about.values.map((v, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded border">
                      <div className="font-semibold">{v.label}</div>
                      <div className="text-sm">{v.text}</div>
                      {v.icon && <div className="text-xs text-gray-400">{v.icon}</div>}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No hay valores agregados</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* VOLUNTEERING */}
        <section className="border rounded p-3">
          <h3 className="font-semibold">Voluntariado</h3>
          <div style={{ padding: 12 }}>
            <h4
              className="font-bold"
              style={{ color: volunteering.volunteeringTitleColor || "#000000" }}
            >
              {volunteering.volunteeringTitle || "(Sin título)"}
            </h4>
            <p>{volunteering.volunteeringDescription || ""}</p>

            {volunteering.volunteeringVisualType === "video" &&
            volunteering.volunteeringVisual ? (
              <iframe
                title="vol-video"
                src={String(volunteering.volunteeringVisual)}
                className="w-full h-40 mt-2"
                style={{ border: 0 }}
                allowFullScreen
              />
            ) : volunteering.volunteeringVisual ? (
              <img
                src={volunteering.volunteeringVisual}
                alt="Voluntariado Visual"
                className="mt-2 max-w-full h-auto rounded"
              />
            ) : (
              <p className="text-sm text-gray-400 mt-2">Sin visual</p>
            )}

            <div className="mt-3 space-y-3">
              {(volunteering.volunteerTypes || []).length > 0 ? (
                volunteering.volunteerTypes.map((vt) => (
                  <div key={vt.id} className="p-2 border rounded">
                    <div
                      className="font-semibold"
                      style={{ color: volunteering.volunteerTypeTitleColor || "#000000" }}
                    >
                      {vt.title}
                    </div>
                    <div className="text-sm">{vt.description}</div>
                    <div className="text-xs mt-1">Habilidades: {vt.skills?.join(", ")}</div>
                    <div className="text-xs">Herramientas: {vt.tools?.join(", ")}</div>
                    <div className="text-xs">
                      Fecha: {vt.date} · {vt.location}
                    </div>
                    {vt.formEditable && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="text-xs font-semibold">Formulario (editable)</div>
                        {(vt.formQuestions || []).length > 0 ? (
                          vt.formQuestions.map((q) => (
                            <div key={q.id} className="text-xs text-gray-700">
                              - {q.question}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400">Sin preguntas</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No hay tipos de voluntarios</div>
              )}
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="border rounded p-3">
          <h3 className="font-semibold">Ubicación</h3>
          <div style={{ padding: 12 }}>
            <div
              className="font-semibold"
              style={{ color: location.locationTitleColor || "#000000" }}
            >
              {location.locationTitle || "Ubicación"}
            </div>
            {location.locationLink ? (
              <a
                href={location.locationLink}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-600 underline text-sm"
              >
                {location.locationLink}
              </a>
            ) : (
              <div className="text-sm text-gray-400">Sin link de ubicación</div>
            )}
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section className="border rounded p-3">
          <h3 className="font-semibold">Testimonios</h3>
          <div style={{ padding: 12 }}>
            <div
              className="font-semibold"
              style={{ color: testimonials.testimonialsTitleColor || "#000000" }}
            >
              {testimonials.testimonialsTitle || "Testimonios"}
            </div>
            <p className="text-sm">{testimonials.testimonialsDescription || ""}</p>
            <div className="mt-3 space-y-3">
              {(testimonials.testimonials || []).length > 0 ? (
                testimonials.testimonials.map((t) => (
                  <div key={t.id} className="p-2 border rounded">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm">{t.description}</div>
                    {t.videoUrl && (
                      <iframe
                        title={`test-${t.id}`}
                        src={t.videoUrl}
                        className="w-full h-36 mt-2"
                        style={{ border: 0 }}
                        allowFullScreen
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No hay testimonios</div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <section className="border rounded p-3">
          <h3 className="font-semibold">Footer</h3>
          <div style={{ padding: 12 }}>
            <div
              className="font-bold"
              style={{ color: footer.footerTitleColor || "#000000" }}
            >
              {footer.footer?.companyName || "(Empresa)"}
            </div>
            <div className="text-sm">Tel: {footer.footer?.phone || "(sin teléfono)"}</div>
            <div className="text-sm">Email: {footer.footer?.email || "(sin email)"}</div>
            <div className="text-sm">Horario: {footer.footer?.schedule || "(sin horario)"}</div>
            <div className="text-sm">
              Ubicación: {footer.footer?.locationText || "(sin ubicación)"}
            </div>
          </div>
        </section>
      </div>
    </ModalSimple>
  );
}
