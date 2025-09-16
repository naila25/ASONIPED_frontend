import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, AlertCircle, FileText, CheckSquare, Square } from 'lucide-react';

interface Phase3ModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    sectionsToModify: string[];
    documentsToReplace: number[];
  }) => void;
  loading: boolean;
  record: any; // RecordWithDetails
}

const Phase3ModificationModal: React.FC<Phase3ModificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  record
}) => {
  const [comment, setComment] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  // Available sections for modification - memoized to prevent re-creation
  const availableSections = useMemo(() => [
    { id: 'complete_personal_data', name: 'Datos Personales Completos' },
    { id: 'family_information', name: 'Información Familiar' },
    { id: 'disability_information', name: 'Información de Discapacidad' },
    { id: 'socioeconomic_information', name: 'Información Socioeconómica' },
    { id: 'documentation_requirements', name: 'Documentación Requerida' }
  ], []);

  const handleSectionToggle = useCallback((sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleDocumentToggle = useCallback((documentId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Por favor, agregue un comentario explicando las modificaciones requeridas.');
      return;
    }

    onSubmit({
      comment: comment.trim(),
      sectionsToModify: selectedSections,
      documentsToReplace: selectedDocuments
    });
  }, [comment, selectedSections, selectedDocuments, onSubmit]);

  const handleClose = useCallback(() => {
    setComment('');
    setSelectedSections([]);
    setSelectedDocuments([]);
    onClose();
  }, [onClose]);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  }, []);

  // Translate document types to Spanish
  const getDocumentTypeLabel = useCallback((documentType: string) => {
    const translations: { [key: string]: string } = {
      'medical_diagnosis': 'Dictamen Médico',
      'birth_certificate': 'Constancia de Nacimiento',
      'cedula': 'Copia de Cédula',
      'photo': 'Foto Tamaño Pasaporte',
      'pension_certificate': 'Constancia de Pensión CCSS',
      'constancia_pension_alimentaria': 'Constancia de Pensión Alimentaria',
      'cuenta_banco_nacional': 'Cuenta Banco Nacional',
      'study_certificate': 'Constancia de Estudio',
      'payment_info': 'Información de Pago',
      'copias_cedulas_familia': 'Copias de Cédulas Familia',
      'pension_alimentaria': 'Constancia de Pensión Alimentaria',
      'other': 'Otro Documento'
    };
    return translations[documentType] || documentType;
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setSelectedSections([]);
      setSelectedDocuments([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Solicitar Modificación - Fase 3
                </h3>
                <p className="text-sm text-gray-600">
                  Especifique qué secciones y documentos necesitan modificación
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario del Administrador 
              </label>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Explique detalladamente qué modificaciones son necesarias..."
                required
              />
            </div>

            {/* Sections to Modify */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Secciones que Requieren Modificación
              </label>
              <div className="space-y-2">
                {availableSections.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="hidden"
                    />
                    <div className="flex items-center">
                      {selectedSections.includes(section.id) ? (
                        <CheckSquare className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{section.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Documents to Replace */}
            {record?.documents && record.documents.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Documentos que Requieren Reemplazo
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {record.documents.map((doc: any) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleDocumentToggle(doc.id)}
                        className="hidden"
                      />
                      <div className="flex items-center">
                        {selectedDocuments.includes(doc.id) ? (
                          <CheckSquare className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="text-sm text-gray-700">{getDocumentTypeLabel(doc.document_type)}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({doc.original_name})
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {(selectedSections.length > 0 || selectedDocuments.length > 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-900 mb-2">Resumen de Modificaciones:</h4>
                <div className="text-sm text-orange-800">
                  {selectedSections.length > 0 && (
                    <p>• {selectedSections.length} sección(es) seleccionada(s)</p>
                  )}
                  {selectedDocuments.length > 0 && (
                    <p>• {selectedDocuments.length} documento(s) seleccionado(s) para reemplazo</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Solicitar Modificación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Phase3ModificationModal;
