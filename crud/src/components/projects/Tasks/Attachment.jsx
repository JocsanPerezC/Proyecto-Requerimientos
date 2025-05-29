import React, { useEffect, useState } from "react";
import { useParams, useNavigate} from "react-router-dom";

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
      fetchFiles(); // Recargar lista actualizada
    } catch (err) {
      alert("Error al actualizar el texto alternativo.");
    }
  };

  return (
    <div>
      <h2>Archivos de la tarea</h2>
      <button type="button" onClick={() => navigate(`/project/${id}`)}>Volver</button>
      {files.map((file) => {
        const isVideo = file.filepath.match(/\.(mp4|webm|ogg)$/i);
        const fileUrl = `http://localhost:3001/${file.filepath}`;

        return (
            <div key={file.id} style={{ marginBottom: "20px" }}>
            {isVideo ? (
                <video
                controls
                style={{ maxWidth: "300px", borderRadius: "8px" }}
                >
                <source src={fileUrl} type="video/mp4" />
                Tu navegador no soporta video.
                </video>
            ) : (
                <img
                src={fileUrl}
                alt={file.alt_text || "Recurso sin descripción"}
                style={{ maxWidth: "300px", borderRadius: "8px" }}
                />
            )}

            <p><em>{file.alt_text || "Sin descripción"}</em></p>

            <form onSubmit={(e) => handleUpdate(e, file.id)}>
                <input
                type="text"
                name="newAlt"
                defaultValue={file.alt_text}
                placeholder="Editar texto alternativo"
                maxLength="255"
                required
                />
                <button type="submit">Actualizar</button>
            </form>
            </div>
        );
        })}
      
    </div>
  );
};

export default TaskFiles;
