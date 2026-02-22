// import { useEffect } from "react";

// export default function Modal({ open, title, onClose, children }) {
//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   if (!open) return null;

//   return (
//     <div className="modalOverlay" onMouseDown={onClose}>
//       <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
//         <div className="modal__header">
//           <h3 className="modal__title">{title}</h3>
//           <button className="iconBtn" onClick={onClose} aria-label="Close">✕</button>
//         </div>
//         <div className="modal__content">{children}</div>
//       </div>
//     </div>
//   );
// }
