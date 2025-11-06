"use client";

import { Listbox } from "@headlessui/react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  listarDireccionesCliente,
  crearDireccion,
  editarDireccion,
  eliminarDireccion,
} from "@/services/cliente/direccionService";
import type { Cliente } from "@/types/cliente";

interface Direccion {
  id: number;
  texto: string;
  tipo: string;
  enUso?: boolean;
}

const DireccionCard = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [idCliente, setIdCliente] = useState<number | null>(null);

  const [formDireccion, setFormDireccion] = useState("");
  const [formTipo, setFormTipo] = useState("Casa");

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const cliente: Cliente = JSON.parse(storedUser);
      setIdCliente(cliente.idCliente);
    }
  }, []);

  const cargarDirecciones = useCallback(async () => {
    if (!idCliente) return;

    try {
      setLoading(true);
      setError(null);
      const data = await listarDireccionesCliente(idCliente);
      setDirecciones(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar direcciones"
      );
    } finally {
      setLoading(false);
    }
  }, [idCliente]);

  useEffect(() => {
    if (idCliente) {
      cargarDirecciones();
    }
  }, [idCliente, cargarDirecciones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCliente) {
      setError("No se pudo obtener el ID del cliente");
      return;
    }

    if (!formDireccion.trim()) {
      setError("La dirección es requerida");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editandoId) {
        await editarDireccion(editandoId, formDireccion, formTipo);
      } else {
        await crearDireccion(idCliente, formDireccion, formTipo);
      }

      await cargarDirecciones();
      handleCancel();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la dirección"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

    try {
      setLoading(true);
      setError(null);
      await eliminarDireccion(id);
      await cargarDirecciones();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la dirección"
      );
    } finally {
      setLoading(false);
    }
  };

  const editDireccionHandler = (dir: Direccion) => {
    setEditandoId(dir.id);
    setFormDireccion(dir.texto);
    setFormTipo(dir.tipo);
    setFormVisible(true);
  };

  const handleCancel = () => {
    setFormVisible(false);
    setEditandoId(null);
    setFormDireccion("");
    setFormTipo("Casa");
    setError(null);
  };

  if (!idCliente && !loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-gray-500">
          Debes iniciar sesión para ver tus direcciones.
        </p>
      </div>
    );
  }

  if (loading && direcciones.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6 w-full">
      {!formVisible ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Mis Direcciones
            </h2>

            <button
              onClick={() => setFormVisible(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secundario-claro1 text-black rounded-md hover:bg-blue-700 transition"
            >
              <span className="hidden md:inline">Registrar dirección</span>
              <Plus className="w-5 h-5 md:hidden" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="border rounded-md shadow-sm overflow-hidden w-full">
            {direcciones.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No hay direcciones registradas.
              </p>
            ) : (
              <table className="w-full">
                <thead className="bg-secundario-claro text-black border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {direcciones.map((dir) => (
                    <tr key={dir.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {dir.texto}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dir.tipo}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editDireccionHandler(dir)}
                            className="p-2 border rounded hover:bg-gray-100 transition"
                            title="Actualizar dirección"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(dir.id)}
                            disabled={dir.enUso || loading}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              dir.enUso
                                ? "Dirección en uso (no se puede eliminar)"
                                : "Eliminar dirección"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto p-6 border rounded shadow space-y-6 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">
            {editandoId ? "Actualizar Dirección" : "Nueva Dirección"}
          </h3>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={formDireccion}
                onChange={(e) => setFormDireccion(e.target.value)}
                placeholder="Ingresa tu dirección..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <Listbox value={formTipo} onChange={setFormTipo}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span className="block truncate">{formTipo}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg border border-gray-200 focus:outline-none">
                    <Listbox.Option
                      value="Casa"
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 px-4 ${
                          active
                            ? "bg-secundario-claro text-secundario-oscuro"
                            : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={selected ? "font-semibold" : "font-normal"}
                        >
                          Casa
                        </span>
                      )}
                    </Listbox.Option>
                    <Listbox.Option
                      value="Oficina"
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 px-4 ${
                          active
                            ? "bg-secundario-claro text-secundario-oscuro"
                            : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={selected ? "font-semibold" : "font-normal"}
                        >
                          Oficina
                        </span>
                      )}
                    </Listbox.Option>
                    <Listbox.Option
                      value="Otro"
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 px-4 ${
                          active
                            ? "bg-secundario-claro text-secundario-oscuro"
                            : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={selected ? "font-semibold" : "font-normal"}
                        >
                          Otro
                        </span>
                      )}
                    </Listbox.Option>
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-secundario-claro1 text-black rounded-md hover:text-[#5e0956] hover:font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-[#fffdf5f4] transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DireccionCard;
