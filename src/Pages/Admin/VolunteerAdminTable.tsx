import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, getFilteredRowModel} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { fetchVolunteerOptions } from '../../Utils/fetchVolunteers';
import type { VolunteerOption } from '../../types/volunteer';

const VolunteerAdminTable = () => {
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchVolunteerOptions()
      .then(response => {
        setVolunteers(response);
      })
      .catch(error => {
        console.error('Error fetching volunteer options:', error);
      });
  }, []);

  const columns: ColumnDef<VolunteerOption>[] = [
    { 
      accessorKey: 'title', 
      header: 'Título',
      cell: info => <div className="font-medium">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'description', 
      header: 'Descripción',
      cell: info => <div className="max-w-md truncate">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'date', 
      header: 'Fecha',
      cell: info => <div className="whitespace-nowrap">{info.getValue() as string}</div>
    },
    { 
      accessorKey: 'location', 
      header: 'Ubicación',
      cell: info => <div className="whitespace-nowrap">{info.getValue() as string}</div>
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: () => (
        <div className="flex space-x-2">
          <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Editar
          </button>
          <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: volunteers,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Voluntariados</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
            className="px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
            Nuevo Voluntariado
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          Mostrando {table.getRowModel().rows.length} de {volunteers.length} registros
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAdminTable;