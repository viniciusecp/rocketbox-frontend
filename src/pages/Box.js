import React, { useEffect, useState } from "react";
import api from "../services/api";
import { formatDistance } from "date-fns";
import pt from "date-fns/locale/pt";
import Dropzone from "react-dropzone";
import io from "socket.io-client";
import { Link } from "react-router-dom";

import { MdInsertDriveFile } from "react-icons/md";

import logo from "../assets/logo.svg";
import "./Box.css";

export default function Box({ match }) {
  const [box, setBox] = useState({});
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    async function loadBoxes() {
      const response = await api.get(`/boxes/${match.params.id}`);

      setBox(response.data);
    }

    loadBoxes();
  }, [match.params.id]);

  useEffect(() => {
    const socket = io("https://rocketbox-b.herokuapp.com");
    socket.emit("connectRoom", match.params.id);

    socket.on("file", data => setNewFile(data));
  }, [match.params.id]);

  useEffect(() => {
    if (newFile) {
      setBox({ ...box, files: [newFile, ...box.files] });
    }

    setNewFile(null);
  }, [newFile, box]);

  function handleUpload(files) {
    files.forEach(file => {
      const data = new FormData();

      data.append("file", file);

      api.post(`/boxes/${match.params.id}/files`, data);
    });
  }

  return (
    <div className="box-container">
      <header>
        <Link to="/">
          <img src={logo} alt="" />
        </Link>
        <h1>{box.title}</h1>
      </header>

      <Dropzone onDropAccepted={handleUpload}>
        {({ getRootProps, getInputProps }) => (
          <div className="upload" {...getRootProps()}>
            <input {...getInputProps()} />

            <p>Arraste arquivos ou clique aqui</p>
          </div>
        )}
      </Dropzone>

      <ul>
        {box.files &&
          box.files.map(file => (
            <li key={file._id}>
              <a
                className="fileInfo"
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MdInsertDriveFile size={24} color="#a5cfff" />
                <strong>{file.title}</strong>
              </a>

              <span>
                há{" "}
                {formatDistance(new Date(file.createdAt), new Date(), {
                  locale: pt
                })}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
