import React, { useState } from "react";
import api from "../services/api";

import logo from "../assets/logo.svg";
import "./Main.css";

export default function Main({ history }) {
  const [newBox, setNewBox] = useState("");

  async function handleSubmit(e) {
    e.preventDefault(); // bloqueia o redirecionamento

    const response = await api.post("/boxes", {
      title: newBox
    });

    const { _id } = response.data;

    history.push(`/box/${_id}`);
  }

  return (
    <div className="main-container">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="" />
        <input
          placeholder="Criar um box"
          autoFocus={true}
          value={newBox}
          onChange={e => setNewBox(e.target.value)}
        />
        <button type="submit">Criar</button>
      </form>
    </div>
  );
}
