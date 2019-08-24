import React from "react";
import { formatDistance } from "date-fns";
import pt from "date-fns/locale/pt";

import { MdDelete, MdInsertDriveFile } from "react-icons/md";

import "./FileList.css";

export default function FileList({ files, onDelete }) {
  return (
    <>
      {files.map(uploadedFile => (
        <li key={uploadedFile.id}>
          <div className="file-info">
            <MdDelete
              className="delete-icon"
              size={24}
              color="#f00"
              onClick={() => onDelete(uploadedFile.id)}
            />
            <a
              className="file-info"
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdInsertDriveFile size={24} color="#a5cfff" />
              <strong>{uploadedFile.name}</strong>
            </a>
          </div>

          {!!uploadedFile.createdAt ? (
            <span>
              há{" "}
              {formatDistance(new Date(uploadedFile.createdAt), new Date(), {
                locale: pt
              })}
            </span>
          ) : (
            <span>há instantes</span>
          )}
        </li>
      ))}
    </>
  );
}
