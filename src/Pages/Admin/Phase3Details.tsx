import React from 'react';
import CompleteRecordView from '../../Pages/User/Expedientes/CompleteRecordView';
import type { RecordWithDetails } from '../../types/records';

interface Phase3DetailsProps {
  record: RecordWithDetails;
}

const Phase3Details: React.FC<Phase3DetailsProps> = ({ record }) => {
  return <CompleteRecordView record={record} isAdmin={true} />;
};

export default Phase3Details;
