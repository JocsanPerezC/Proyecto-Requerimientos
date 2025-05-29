import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TaskFiles = () => {
  const { id, taskId } = useParams();
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/task/${taskId}/attachments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("username")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setFiles(data.attachments);
      } else {
        alert("Error al obtener los archivos");
      }
    } catch (err) {
      alert("Error de red al obtener los archivos");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

  const handleUpdate = async (e, fileId) => {
    e.preventDefault();
    const newAltText = e.target.elements.newAlt.value;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/attachment/${fileId}/alt`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("username")}`,
        },
        body: JSON.stringify({ alt_text: newAltText }),
      });

      const result = await res.json();
      alert(result.message || "Texto alternativo actualizado.");
      fetchFiles();
    } catch (err) {
      alert("Error al actualizar el texto alternativo.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "10px" }}>Archivos de la tarea</h2>
      <button
        type="button"
        onClick={() => navigate(`/project/${id}`)}
        style={{
          marginBottom: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Volver
      </button>

      {files.map((file) => {
        const isVideo = file.filepath.match(/\.(mp4|webm|ogg)$/i);
        const fileUrl = `http://localhost:3001/${file.filepath}`;

        return (
          <div
            key={file.id}
            style={{
              marginBottom: "30px",
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
              maxWidth: "360px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              {isVideo ? (
                <video controls style={{ maxWidth: "100%", borderRadius: "8px" }}>
                  <source src={fileUrl} type="video/mp4" />
                  Tu navegador no soporta video.
                </video>
              ) : (
                <img
                  src={fileUrl}
                  alt={file.alt_text || "Recurso sin descripción"}
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              )}
            </div>

            <p style={{ textAlign: "center", fontStyle: "italic", color: "#555" }}>
              {file.alt_text || "Sin descripción"}
            </p>

            <form onSubmit={(e) => handleUpdate(e, file.id)} style={{ marginTop: "10px" }}>
              <input
                type="text"
                name="newAlt"
                defaultValue={file.alt_text}
                placeholder="Editar texto alternativo"
                maxLength="255"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginBottom: "8px",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Actualizar
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
};

export default TaskFiles;
