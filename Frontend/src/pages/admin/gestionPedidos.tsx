import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { DynamicTable } from "@components/common/dataTable";
import TableFiltro from "@components/common/tableFiltro";
import TablePaginas from "@components/common/tablePaginas";
import { Badge } from "@components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { obtenerTodosPedidos, actualizarEstadoPedido, obtenerDetallesPedido} from "@/services/ventas/pedidoService";
import type {DetallePedidoItem } from "@/services/ventas/pedidoService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Pedido {
  idPed: number;
  cliente: {
    nomCli: string;
    apeCli: string;
  };
  fecha: string;
  estado: "Nuevo" | "Realizado" | "Rechazado";
  total: number;
}

const GestionPedidos = () => {
  const [allData, setAllData] = useState<Pedido[]>([]);
  const [filtered, setFiltered] = useState<Pedido[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalles, setDetalles] = useState<DetallePedidoItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);

  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const pedidosRaw = await obtenerTodosPedidos();
      type PedidoBackend = {
        idPed?: number; id_ped?: number; fecha?: string; estado?: string; total?: number;
        cliente?: { nomCli?: string; apeCli?: string; nombre?: string; apellido?: string };
      };
      const pedidosMapped: Pedido[] = (pedidosRaw as PedidoBackend[]).map((p) => ({
        idPed: p.idPed ?? p.id_ped ?? 0,
        cliente: p.cliente ? {
          nomCli: p.cliente.nomCli || p.cliente.nombre || 'Cliente',
          apeCli: p.cliente.apeCli || p.cliente.apellido || ''
        } : { nomCli: 'Cliente', apeCli: '' },
        fecha: p.fecha || new Date().toISOString(),
        estado: (p.estado as Pedido['estado']) || 'Nuevo',
        total: p.total ?? 0,
      }));
      setAllData(pedidosMapped);
      setFiltered(pedidosMapped);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      alert("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (idPedido: number, nuevoEstado: string) => {
    try {
      await actualizarEstadoPedido(idPedido, nuevoEstado);
      // Recargar pedidos
      await cargarPedidos();
      alert("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error al actualizar el estado del pedido");
    }
  };

  const columns: ColumnDef<Pedido>[] = [
    { 
      accessorKey: "idPed", 
      header: "ID Pedido",
      cell: ({ row }) => `#${row.getValue("idPed")}`
    },
    { 
      accessorKey: "cliente", 
      header: "Cliente",
      cell: ({ row }) => {
        const cliente = row.getValue("cliente") as Pedido["cliente"];
        return `${cliente.nomCli} ${cliente.apeCli}`;
      }
    },
    { 
      accessorKey: "fecha", 
      header: "Fecha",
      cell: ({ row }) => new Date(row.getValue("fecha")).toLocaleDateString()
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const value = row.getValue("estado") as Pedido["estado"];
        const color =
          value === "Nuevo"
            ? "bg-yellow-100 text-yellow-700"
            : value === "Realizado"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";
        return <Badge className={color}>{value}</Badge>;
      },
    },
    { 
      accessorKey: "total", 
      header: "Monto Total",
      cell: ({ row }) => `S/ ${Number(row.getValue("total")).toFixed(2)}`
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const pedido = row.original;
        return (
          <div className="flex gap-2 items-center">
            <Select
              value={pedido.estado}
              onValueChange={(value) => handleCambiarEstado(pedido.idPed, value)}
            >
              <SelectTrigger className="w-[130px] text-xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Realizado">Realizado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" className="text-xs" onClick={() => abrirDetalles(pedido)}>
              Ver
            </Button>
          </div>
        );
      },
    },
  ];
  const abrirDetalles = async (pedido: Pedido) => {
    try {
      setPedidoSeleccionado(pedido);
      setDetalleLoading(true);
      setShowModal(true);
      const data = await obtenerDetallesPedido(pedido.idPed);
      setDetalles(data);
    } catch (e) {
      console.error("Error al cargar detalles", e);
      alert("No se pudieron cargar los detalles del pedido");
      setShowModal(false);
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setDetalles([]);
    setPedidoSeleccionado(null);
  };

  const handleSearch = (value: string) => {
    const res = allData.filter((p) =>
      `${p.cliente.nomCli} ${p.cliente.apeCli}`.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(res);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <p className="text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pedidos</h1>

        <Button variant="outline" className="flex items-center gap-2 bg-secundario text-black">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar pedidos</span>
        </Button>
      </div>

      {/* Contenedor principal */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TableFiltro
          searchPlaceholder="Buscar por cliente..."
          onSearch={handleSearch}
          filterGroups={[
            {
              label: "Estado",
              items: ["Nuevo", "Realizado", "Rechazado"],
            },
          ]}
        />

        <DynamicTable columns={columns} data={paginatedData} />

        <TablePaginas
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          totalItems={filtered.length}
          perPage={perPage}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Detalles del Pedido {pedidoSeleccionado && `#${pedidoSeleccionado.idPed}`}</h2>
              <Button variant="ghost" onClick={cerrarModal}>Cerrar</Button>
            </div>
            {detalleLoading ? (
              <p className="text-sm text-gray-500">Cargando detalles...</p>
            ) : detalles.length === 0 ? (
              <p className="text-sm text-gray-500">No hay productos en este pedido.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2">Producto</th>
                      <th className="text-right py-2">Cantidad</th>
                      <th className="text-right py-2">Precio Unitario</th>
                      <th className="text-right py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map(d => (
                      <tr key={d.idDetalle} className="border-b last:border-0">
                        <td className="py-2">{d.producto?.nomProd || 'Producto'}</td>
                        <td className="py-2 text-right">{d.cantidad}</td>
                        <td className="py-2 text-right">S/ {Number(d.precioUnit).toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">S/ {Number(d.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {pedidoSeleccionado && (
                      <tr>
                        <td colSpan={3} className="py-2 text-right font-semibold">Total Pedido:</td>
                        <td className="py-2 text-right font-bold">S/ {Number(pedidoSeleccionado.total).toFixed(2)}</td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidos;