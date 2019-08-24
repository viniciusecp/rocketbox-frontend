import React from "react";

import { MdCheckCircle, MdError, MdLink } from "react-icons/md";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import "./NewFileList.css";

export default function NewFileList({ files, onDelete }) {
  return (
    <>
      {files.map(uploadedFile => (
        <li key={uploadedFile.id}>
          <div className="file-info">
            <div
              className="preview"
              style={{ backgroundImage: `url(${uploadedFile.preview})` }}
              alt=""
            />
            <div className="file-data">
              <strong>{uploadedFile.name}</strong>
              <span>
                {uploadedFile.readableSize}{" "}
                {!!uploadedFile.url && (
                  <button
                    onClick={() => {
                      onDelete(uploadedFile.id);
                    }}
                  >
                    Excluir
                  </button>
                )}
              </span>
            </div>
          </div>

          <div>
            {!uploadedFile.uploaded && !uploadedFile.error && (
              <CircularProgressbar
                styles={{
                  root: { width: 24 },
                  path: { stroke: "#7159c1" }
                }}
                strokeWidth={10}
                value={uploadedFile.progress}
              />
            )}

            {uploadedFile.url && (
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MdLink style={{ marginRight: 8 }} size={24} color="#222" />
              </a>
            )}

            {uploadedFile.uploaded && (
              <MdCheckCircle size={24} color="#78e5d5" />
            )}
            {uploadedFile.error && <MdError size={24} color="#e57878" />}
          </div>
        </li>
      ))}
    </>
  );
}
