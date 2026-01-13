import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Fuse from "fuse.js";
import {
  Copy,
  Check,
  Search,
  X,
  ChevronRight,
  ArrowLeft,
  FileText,
  Barcode,
  Eye, // Agregamos el icono del ojo para la tabla
} from "lucide-react";
import "./App.css";

// URL 1: PRODUCTOS (MK/SAP)
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRM67vqDANxMwX22Ez6dT4MOs6bvzAIX7lMfJi6woZnNkCuw_VfcSpZxHyKF-cWU1p8G-UTMki44U5_/pub?output=csv";

// URL 2: ÓRDENES DE COMPRA (OC)
const OC_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRM67vqDANxMwX22Ez6dT4MOs6bvzAIX7lMfJi6woZnNkCuw_VfcSpZxHyKF-cWU1p8G-UTMki44U5_/pub?gid=1526825770&single=true&output=csv";

// --- COMPONENTE 1: MENU PRINCIPAL ---
const MenuPrincipal = ({ onNavigate }) => {
  return (
    <div className="menu-container animate-fade-in">
      <h1 className="app-title">Portal de Gestión</h1>
      <p className="menu-subtitle">Selecciona una herramienta</p>

      <div className="menu-grid">
        <button className="menu-card" onClick={() => onNavigate("codigos")}>
          <div className="icon-circle icon-codes">
            <Barcode size={32} />
          </div>
          <h3>Buscador de Códigos</h3>
          <p>Consultar referencias MK y SAP</p>
        </button>

        <button className="menu-card" onClick={() => onNavigate("oc")}>
          <div className="icon-circle icon-oc">
            <FileText size={32} />
          </div>
          <h3>Buscador de OC</h3>
          <p>Consultar Órdenes de Compra</p>
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE 2: BUSCADOR DE CÓDIGOS ---
const BuscadorCodigos = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    Papa.parse(GOOGLE_SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: (err) => console.error(err),
    });
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setSelectedItem(null);
    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const fuse = new Fuse(data, {
      keys: ["codigoMK", "descMK", "codigoSAP", "descSAP"],
      threshold: 0.3,
      ignoreLocation: true,
    });
    const result = fuse.search(value).slice(0, 7);
    setSuggestions(result.map((r) => r.item));
  };

  const selectSuggestion = (item) => {
    setSelectedItem(item);
    setSuggestions([]);
    setSearchTerm(item.descMK);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setSelectedItem(null);
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="module-container animate-fade-in">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} /> Volver
      </button>

      <div className="search-wrapper">
        <h2 className="module-title">Buscador de Códigos</h2>

        <div className="search-box-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Escribe código o descripción..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={clearSearch}>
              <X size={18} />
            </button>
          )}
        </div>
        {searchTerm && (
          <span className="text-erase-explanation">
            {" "}
            Presiona el botón X para borrar la búsqueda actual.
          </span>
        )}

        {suggestions.length > 0 && !selectedItem && (
          <ul className="suggestions-dropdown">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => selectSuggestion(item)}
                className="suggestion-item"
              >
                <div className="sug-text">
                  <span className="sug-main">{item.descMK}</span>
                  <span className="sug-sub">
                    {item.codigoMK} | {item.codigoSAP}
                  </span>
                </div>
                <ChevronRight size={16} color="#ccc" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="result-area">
        {loading && <p className="loading-text">Cargando base de datos...</p>}

        {selectedItem && (
          <div className="card animate-fade-in">
            {/* Fila MK */}
            <div className="data-row mk-row">
              <div className="data-code-block">
                <span className="label-sm">Código MK</span>
                <div className="code-flex">
                  <span className="code-text">{selectedItem.codigoMK}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(selectedItem.codigoMK, "mk")}
                  >
                    {copiedId === "mk" ? (
                      <Check size={18} color="green" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="data-desc-block">
                <span className="desc-text">{selectedItem.descMK}</span>
              </div>
            </div>

            {/* Fila SAP */}
            <div className="data-row sap-row">
              <div className="data-code-block">
                <span className="label-sm">Código SAP</span>
                <div className="code-flex">
                  <span className="code-text">{selectedItem.codigoSAP}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(selectedItem.codigoSAP, "sap")}
                  >
                    {copiedId === "sap" ? (
                      <Check size={18} color="green" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="data-desc-block">
                <span className="desc-text">{selectedItem.descSAP}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE 3: BUSCADOR DE OC (CON BOTÓN WHATSAPP) ---
const BuscadorOC = ({ onBack }) => {
  const [ocData, setOcData] = useState([]);
  const [filteredOc, setFilteredOc] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOC, setSelectedOC] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // NUEVO: Estado para feedback de copiado

  useEffect(() => {
    Papa.parse(OC_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setOcData(results.data);
        setFilteredOc(results.data);
        setLoading(false);
      },
      error: (err) => {
        console.error(err);
        setLoading(false);
      },
    });
  }, []);

  const filterData = (term, dataToFilter = ocData) => {
    const lowerVal = term.toLowerCase();
    return dataToFilter.filter((item) => {
      const doc = item.Documento_compras
        ? item.Documento_compras.toLowerCase()
        : "";
      const texto = item.Texto_breve ? item.Texto_breve.toLowerCase() : "";
      const prov = item.Nombre_de_proveedor
        ? item.Nombre_de_proveedor.toLowerCase()
        : "";
      return (
        doc.includes(lowerVal) ||
        texto.includes(lowerVal) ||
        prov.includes(lowerVal)
      );
    });
  };

  const handleSearch = (val) => {
    setSearchTerm(val);
    const filtered = filterData(val);
    setFilteredOc(filtered);
    if (val.trim().length > 0) {
      setSuggestions(filtered.slice(0, 7));
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    const isNumericSearch =
      !isNaN(searchTerm.replace(/\s/g, "")) && searchTerm.length > 0;
    let valorFinal = "";
    if (isNumericSearch) {
      valorFinal = item.Documento_compras;
    } else {
      valorFinal = item.Texto_breve;
    }
    setSearchTerm(valorFinal);
    const newFilteredList = filterData(valorFinal);
    setFilteredOc(newFilteredList);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setFilteredOc(ocData);
  };

  // --- NUEVA FUNCIÓN: COPIAR DATOS DEL MODAL ---
  const handleCopyModal = () => {
    if (!selectedOC) return;

    // Construimos el texto con formato para WhatsApp (* = negrita)
    const textToCopy = `*DETALLE DE OC*
----------------
📄 *N° Doc:* ${selectedOC.Documento_compras}
🏢 *Prov:* ${selectedOC.Nombre_de_proveedor}
📅 *Fecha:* ${selectedOC.Fecha_documento}
📦 *Cant:* ${selectedOC.Cantidad_pedido}
📝 *Desc:* ${selectedOC.Texto_breve}
${selectedOC.Observacion ? `ℹ️ *Obs:* ${selectedOC.Observacion}` : ""}`;

    navigator.clipboard.writeText(textToCopy);

    // Feedback visual
    setCopiedId("modal-action");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isTextSearch = isNaN(searchTerm) && searchTerm.length > 0;

  return (
    <>
      <div className="module-container animate-fade-in">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div className="search-wrapper">
          <h2 className="module-title">Buscador de OC</h2>
          <div className="search-box-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar OC, descripción o proveedor..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-btn" onClick={clearSearch}>
                <X size={18} />
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => selectSuggestion(item)}
                  className="suggestion-item"
                >
                  <div className="sug-text">
                    {isTextSearch ? (
                      <span className="sug-main">{item.Texto_breve}</span>
                    ) : (
                      <>
                        <span className="sug-main">
                          {item.Documento_compras}
                        </span>
                        <span className="sug-sub">{item.Texto_breve}</span>
                      </>
                    )}
                  </div>
                  <ChevronRight size={16} color="#ccc" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="table-wrapper">
          {loading && (
            <p className="loading-text">Cargando Órdenes de Compra...</p>
          )}
          {!loading && (
            <div className="table-responsive">
              <table className="oc-table">
                <thead>
                  <tr>
                    <th>N° Doc</th>
                    <th>Descripción</th>
                    <th>Cant.</th>
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOc.slice(0, 50).map((row, index) => (
                    <tr key={index} onClick={() => setSelectedOC(row)}>
                      <td className="font-mono">{row.Documento_compras}</td>
                      <td className="desc-cell">{row.Texto_breve}</td>
                      <td className="text-center">{row.Cantidad_pedido}</td>
                      <td className="text-center">
                        <Eye size={18} color="var(--primary)" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOc.length === 0 && (
                <p className="no-results">No hay resultados</p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOC && (
        <div className="modal-overlay" onClick={() => setSelectedOC(null)}>
          <div
            className="modal-content animate-pop-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Detalle de OC</h3>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedOC(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-item">
                <span className="m-label">N° Documento</span>
                <span className="m-value big-code">
                  {selectedOC.Documento_compras}
                </span>
              </div>
              <div className="modal-item">
                <span className="m-label">Proveedor</span>
                <span className="m-value">
                  {selectedOC.Nombre_de_proveedor}
                </span>
              </div>
              <div className="modal-grid">
                <div className="modal-item">
                  <span className="m-label">Fecha</span>
                  <span className="m-value">{selectedOC.Fecha_documento}</span>
                </div>
                <div className="modal-item">
                  <span className="m-label">Cantidad</span>
                  <span className="m-value">{selectedOC.Cantidad_pedido}</span>
                </div>
              </div>
              <div className="modal-item">
                <span className="m-label">Descripción</span>
                <p className="m-value desc-full">{selectedOC.Texto_breve}</p>
              </div>
              {selectedOC.Observacion && (
                <div className="modal-item obs-box">
                  <span className="m-label">Observación</span>
                  <p className="m-value">{selectedOC.Observacion}</p>
                </div>
              )}

              {/* --- NUEVO BOTÓN COPIAR --- */}
              <button className="modal-action-btn" onClick={handleCopyModal}>
                {copiedId === "modal-action" ? (
                  <>
                    {" "}
                    <Check size={20} /> ¡Datos Copiados!{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <Copy size={20} /> Copiar Datos{" "}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [currentView, setCurrentView] = useState("home"); // 'home', 'codigos', 'oc'

  return (
    <div className="container">
      {currentView === "home" && <MenuPrincipal onNavigate={setCurrentView} />}

      {currentView === "codigos" && (
        <BuscadorCodigos onBack={() => setCurrentView("home")} />
      )}

      {currentView === "oc" && (
        <BuscadorOC onBack={() => setCurrentView("home")} />
      )}
    </div>
  );
}

export default App;
