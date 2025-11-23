import { useEffect, useRef } from "react";
import useCarrito from "@/hooks/useCarrito";
import { logoutUsuario } from "@/services/auth/userServices";
import Swal from "sweetalert2";

const InactivityHandler = () => {
  const { clearCarrito } = useCarrito();
  const timerRef = useRef<number | null>(null);
  const warnRef = useRef<number | null>(null);
  const loggedInRef = useRef<boolean>(false);

  const minutes = Number(import.meta.env.VITE_AUTO_LOGOUT_MINUTES ?? 5);
  const timeoutMs = Math.max(1, minutes) * 60 * 1000;
  const warnBeforeMs = 60 * 1000; // 1 minute before

  const saveCarritoToHistory = () => {
    try {
      const raw = localStorage.getItem("carrito");
      const carrito = raw ? JSON.parse(raw) : null;
      // Only persist to history if there's an associated pedidoRegistrado (i.e. details were confirmed)
      if (carrito && Array.isArray(carrito) && carrito.length > 0) {
        try {
          const pedidoRaw = localStorage.getItem("pedidoRegistrado");
          const pedidoObj = pedidoRaw ? JSON.parse(pedidoRaw) : null;

          const getPidFromObj = (obj: unknown): number | null => {
            if (!obj || typeof obj !== "object") return null;
            const rec = obj as Record<string, unknown>;
            const pedido = rec["pedido"];
            if (pedido && typeof pedido === "object") {
              const p = pedido as Record<string, unknown>;
              const id = p["id_ped"] ?? p["id"];
              if (typeof id === "number") return id;
              if (typeof id === "string" && !isNaN(Number(id)))
                return Number(id);
            }
            const direct = rec["id_ped"] ?? rec["id"];
            if (typeof direct === "number") return direct;
            if (typeof direct === "string" && !isNaN(Number(direct)))
              return Number(direct);
            return null;
          };

          const pid = getPidFromObj(pedidoObj);

          if (!pid) {
            // No confirmed pedido — do not save to history.
            return;
          }

          // get payment status map if available
          let pagoStatus: string | undefined;
          try {
            const mapRaw = localStorage.getItem("pedidosPagoStatus");
            const map = mapRaw ? JSON.parse(mapRaw) : {};
            pagoStatus = map[pid];
          } catch {
            pagoStatus = undefined;
          }

          const historyRaw = localStorage.getItem("carritosPendientes");
          const history = historyRaw ? JSON.parse(historyRaw) : [];
          const entry = {
            id: Date.now(),
            createdAt: Date.now(),
            items: carrito,
            origin: "auto-logout",
            pedidoRegistrado: pedidoObj,
            pagoStatus,
          };
          history.unshift(entry);
          localStorage.setItem("carritosPendientes", JSON.stringify(history));
        } catch (err) {
          // If anything fails while trying to include pedido metadata, skip saving.
          console.warn("No se pudo guardar carrito en historial:", err);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const handleTimeout = async () => {
    try {
      await logoutUsuario();
    } catch {
      /* ignore */
    }

    try {
      localStorage.removeItem("usuario");
    } catch {
      /* ignore */
    }

    // Save carrito to history then clear
    saveCarritoToHistory();
    try {
      clearCarrito();
    } catch {
      /* ignore */
    }

    try {
      await Swal.fire({
        icon: "info",
        title: "Sesión cerrada por inactividad",
        text: `La sesión se cerró automáticamente por inactividad de ${minutes} minutos. Tu carrito fue guardado en el historial de carritos pendientes.`,
      });
    } catch {
      /* ignore */
    }

    try {
      window.dispatchEvent(new Event("userLoggedOut"));
    } catch {
      /* ignore */
    }

    try {
      window.location.href = "/";
    } catch {
      /* ignore */
    }
  };

  const scheduleWarningAndTimeout = () => {
    // clear existing timers
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warnRef.current) {
      window.clearTimeout(warnRef.current);
      warnRef.current = null;
    }

    if (!loggedInRef.current) return;

    // schedule main timeout
    timerRef.current = window.setTimeout(() => {
      // when main timeout executes, ensure warning timer is cleared
      if (warnRef.current) {
        window.clearTimeout(warnRef.current);
        warnRef.current = null;
      }
      handleTimeout();
    }, timeoutMs) as unknown as number;

    // schedule warning if there's at least 1 minute before timeout
    if (timeoutMs > warnBeforeMs) {
      const warnDelay = timeoutMs - warnBeforeMs;
      warnRef.current = window.setTimeout(async () => {
        try {
          const res = await Swal.fire({
            icon: "warning",
            title: "Inactividad detectada",
            text: "Tu sesión cerrará en 1 minuto. ¿Deseas mantenerla activa?",
            showCancelButton: true,
            confirmButtonText: "Mantener sesión",
            cancelButtonText: "Cerrar sesión ahora",
          });
          if (res.isConfirmed) {
            // user wants to stay: reschedule timers
            scheduleWarningAndTimeout();
          } else if (res.dismiss === Swal.DismissReason.cancel) {
            // user requested immediate logout
            handleTimeout();
          }
        } catch {
          /* ignore */
        }
      }, warnDelay) as unknown as number;
    }
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
      "click",
    ];

    const activityHandler = () => {
      if (!loggedInRef.current) return;
      scheduleWarningAndTimeout();
    };

    const onUserLoggedIn = () => {
      loggedInRef.current = true;
      scheduleWarningAndTimeout();
    };

    const onUserLoggedOut = () => {
      loggedInRef.current = false;
      // clear timers
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (warnRef.current) {
        window.clearTimeout(warnRef.current);
        warnRef.current = null;
      }
    };

    // init logged state
    try {
      loggedInRef.current = !!localStorage.getItem("usuario");
    } catch {
      loggedInRef.current = false;
    }

    if (loggedInRef.current) scheduleWarningAndTimeout();

    for (const ev of events) window.addEventListener(ev, activityHandler);
    window.addEventListener("userLoggedIn", onUserLoggedIn);
    window.addEventListener("userLoggedOut", onUserLoggedOut);

    return () => {
      for (const ev of events) window.removeEventListener(ev, activityHandler);
      window.removeEventListener("userLoggedIn", onUserLoggedIn);
      window.removeEventListener("userLoggedOut", onUserLoggedOut);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (warnRef.current) {
        window.clearTimeout(warnRef.current);
        warnRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default InactivityHandler;
