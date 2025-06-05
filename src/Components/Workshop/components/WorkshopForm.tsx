import React, { useEffect, useState } from 'react';
import { getAllEnrollments } from '../services/enrollmentServices';
import type { WorkshopEnrollment } from '../services/enrollmentServices';

const WorkshopForms: React.FC = () => {
  const [enrollments, setEnrollments] = useState<WorkshopEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEnrollments()
      .then(data => {
        console.log('Enrollments response:', data);
        setEnrollments(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Workshop Enrollments</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Notes</th>
            <th className="border px-4 py-2">Workshop ID</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map(e => (
            <tr key={e.id}>
              <td className="border px-4 py-2">{e.fullName}</td>
              <td className="border px-4 py-2">{e.email}</td>
              <td className="border px-4 py-2">{e.phone}</td>
              <td className="border px-4 py-2">{e.notes}</td>
              <td className="border px-4 py-2">{e.workshopId}</td>
              <td className="border px-4 py-2">{e.created_at ? new Date(e.created_at).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkshopForms;