import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "500px" }) {
    // Truco pro: Bloquear el scroll de la página de fondo cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            // Bloqueamos tanto el body como el html para asegurar que no haya scroll
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            // Restauramos cuando se cierra
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = ""; // Lo dejamos vacío para que tu CSS mande
        }

        // Limpieza al desmontar (si el usuario cambia de página de golpe)
        return () => {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    // Si no está abierto, no renderiza absolutamente nada
    if (!isOpen) return null;

    return (
        <div
            // OVERLAY (El fondo oscuro)
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.6)", // Azul oscuro semi-transparente
                backdropFilter: "blur(3px)", // Desenfoque moderno tipo Apple/Windows 11
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999, // Asegura que esté por encima de TODO
                padding: "20px",
            }}
            onClick={onClose} // Si haces clic afuera del cuadro, se cierra
        >
            <div
                // CONTENEDOR DEL MODAL (La caja blanca)
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: maxWidth,
                    maxHeight: "90vh", // No permite que sea más alto que la pantalla
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    animation: "fadeInUp 0.2s ease-out", // Le da un toque suave al aparecer
                    textAlign: "center"
                }}
                onClick={(e) => e.stopPropagation()} // Evita que al hacer clic ADENTRO se cierre
            >
                {/* HEADER */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                        textAlign: "center"
                    }}
                >
                    <h3 style={{ margin: "auto", color: "#1e293b", fontSize: "1rem", textAlign: "center" }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            color: "#94a3b8",
                            lineHeight: 1,
                            padding: "0 5px",
                            transition: "color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"} // Se pone rojo al pasar el ratón
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        &times; {/* Entidad HTML para la 'X' */}
                    </button>
                </div>

                {/* BODY (El contenido dinámico) */}
                <div
                    style={{
                        padding: "20px",
                        overflowY: "auto", // Si el contenido es gigante, crea una barra de desplazamiento interna
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}