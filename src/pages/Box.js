import React, { Component } from "react";
import api from "../services/api";
import Dropzone from "react-dropzone";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { uniqueId } from "lodash";
import filesize from "filesize";

import { MdAutorenew } from "react-icons/md";

import logo from "../assets/logo.svg";
import "./Box.css";

import NewFileList from "../components/NewFileList";
import FileList from "../components/FileList";

export default class Box extends Component {
  state = {
    boxId: this.props.match.params.id,
    box: { files: [] }, // precisa iniciar apenas o vetor, por causa do primeiro render
    notification: false,
    newLayout: true
  };

  async componentDidMount() {
    // this.subscribeToNewFiles();

    const response = await api.get(`/boxes/${this.state.boxId}`);
    const configuredFiles = response.data.files.map(file => ({
      id: file._id,
      name: file.title,
      readableSize: filesize(file.size),
      preview: file.url,
      uploaded: true,
      url: file.url,
      createdAt: file.createdAt
    }));
    this.setState({ box: { ...response.data, files: configuredFiles } });
  }

  componentWillUnmount() {
    this.state.box.files.forEach(file => URL.revokeObjectURL(file.preview));
  }

  subscribeToNewFiles = () => {
    // const socket = io("https://rocketbox-b.herokuapp.com");
    const socket = io("http://localhost:3333");
    socket.emit("connectRoom", this.state.boxId);

    socket.on("file", data => {
      this.setState({
        box: { ...this.state.box, files: [data, ...this.state.box.files] },
        notification: { action: "Arquivo adicionado!", description: data.title }
      });

      setTimeout(() => {
        this.setState({ notification: false });
      }, 5000);
    });
  };

  handleUpload = files => {
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }));

    this.setState({
      box: {
        ...this.state.box,
        files: this.state.box.files.concat(uploadedFiles)
      }
    });

    uploadedFiles.forEach(this.processUpload);
  };

  processUpload = async uploadedFile => {
    const data = new FormData();

    data.append("file", uploadedFile.file, uploadedFile.name); // o name não é necessário, é mais pra reconhecimento no log

    try {
      const response = await api.post(
        `/boxes/${this.state.boxId}/files`,
        data,
        {
          onUploadProgress: e => {
            const progress = parseInt(Math.round((e.loaded * 100) / e.total)); // pra transformar em percentual

            this.updateFile(uploadedFile.id, { progress });
          }
        }
      );

      this.updateFile(uploadedFile.id, {
        uploaded: true,
        id: response.data._id,
        url: response.data.url
      });
    } catch (err) {
      this.updateFile(uploadedFile.id, { error: true });
    }
  };

  updateFile = (id, data) => {
    const updatedFiles = this.state.box.files.map(uploadedFile => {
      return id === uploadedFile.id
        ? { ...uploadedFile, ...data }
        : uploadedFile;
    });

    this.setState({ box: { ...this.state.box, files: updatedFiles } });
  };

  handleDeleteFile = async fileId => {
    await api.delete(`/boxes/${this.state.boxId}/files/${fileId}`);

    const files = this.state.box.files.filter(file => file.id !== fileId);
    console.log(files);
    this.setState({ box: { ...this.state.box, files } });
  };

  render() {
    const { box, notification } = this.state;

    return (
      <div className="box-container">
        <header>
          <Link to="/">
            <img src={logo} alt="" />
          </Link>
          <h1>{box.title}</h1>
          <MdAutorenew
            style={{ cursor: "pointer" }}
            size={24}
            color="#7159c1"
            onClick={() => this.setState({ newLayout: !this.state.newLayout })}
          />
        </header>

        <Dropzone accept="image/*" onDropAccepted={this.handleUpload}>
          {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
            <div
              className={`upload 
              ${isDragActive ? "isDragActive" : ""}
              ${isDragReject ? "isDragReject" : ""}
            `}
              {...getRootProps()}
            >
              <input {...getInputProps()} />

              <p>
                {!isDragActive
                  ? "Arraste arquivos ou clique aqui..."
                  : isDragReject
                  ? "Arquivo não suportado"
                  : "Solte os arquivos aqui"}
              </p>
            </div>
          )}
        </Dropzone>

        <ul>
          {!!box.files.length && this.state.newLayout ? (
            <NewFileList files={box.files} onDelete={this.handleDeleteFile} />
          ) : (
            <FileList files={box.files} onDelete={this.handleDeleteFile} />
          )}
        </ul>

        {notification && (
          <div className="notification">
            <strong>{notification.action}</strong>
            <p>{notification.description}</p>
          </div>
        )}
      </div>
    );
  }
}
