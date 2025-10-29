"use client";

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
      setError(err instanceof Error ? err.message : "Error al cargar direcciones");
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
      setError(err instanceof Error ? err.message : "Error al guardar la dirección");
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
      setError(err instanceof Error ? err.message : "Error al eliminar la dirección");
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
        <p className="text-gray-500">Debes iniciar sesión para ver tus direcciones.</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              <select
                value={formTipo}
                onChange={(e) => setFormTipo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Casa">Casa</option>
                <option value="Oficina">Oficina</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-100 transition disabled:opacity-50"
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
