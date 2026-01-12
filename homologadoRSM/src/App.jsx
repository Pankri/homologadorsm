import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import Fuse from "fuse.js";
import { Copy, Check, Search, X, ChevronRight } from "lucide-react";
import "./App.css";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRM67vqDANxMwX22Ez6dT4MOs6bvzAIX7lMfJi6woZnNkCuw_VfcSpZxHyKF-cWU1p8G-UTMki44U5_/pub?output=csv";

function App() {
  const [data, setData] = useState([]); // Todos los datos
  const [suggestions, setSuggestions] = useState([]); // Lista desplegable
  const [selectedItem, setSelectedItem] = useState(null); // El item que elegiste
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Carga inicial
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

  // Lógica de Búsqueda (Sugerencias)
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSelectedItem(null); // Si escribe, reseteamos la selección final

    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const fuse = new Fuse(data, {
      keys: ["codigoMK", "descMK", "codigoSAP", "descSAP"],
      threshold: 0.3,
      ignoreLocation: true,
    });

    // Limitamos a 7 sugerencias para que no sea una lista infinita
    const result = fuse.search(value).slice(0, 7);
    setSuggestions(result.map((r) => r.item));
  };

  // Cuando el usuario hace click en una sugerencia
  const selectSuggestion = (item) => {
    setSelectedItem(item);
    setSuggestions([]); // Ocultar lista
    setSearchTerm(item.descMK); // Poner el nombre en el input
  };

  // Limpiar todo
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
    <div className="container">
      <div className="search-wrapper">
        <h2 className="app-title">Buscador de códigos MK / SAP</h2>

        {/* BARRA DE BÚSQUEDA */}
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

        {/* LISTA DESPLEGABLE (DROPDOWN) - Solo aparece si hay sugerencias y NO hay selección */}
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

      {/* RESULTADO FINAL - Solo aparece si seleccionaste algo */}
      <div className="result-area">
        {loading && <p className="loading-text">Cargando base de datos...</p>}

        {selectedItem && (
          <div className="card animate-fade-in">
            {/* Fila MK */}
            <div className="data-row mk-row">
              <div className="data-code">
                <span className="label">Código MK:</span>
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
              <div className="data-desc">
                <span className="label">{selectedItem.descMK}</span>
              </div>
            </div>

            {/* Fila SAP */}
            <div className="data-row sap-row">
              <div className="data-code">
                <span className="label">Código SAP:</span>
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
              <div className="data-desc">
                <span className="label">{selectedItem.descSAP}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
