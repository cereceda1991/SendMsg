import './App.css';
import { read, utils, write } from 'xlsx';
import React, { useState, useEffect } from 'react';
import logo from './assets/images/logo.png';
import SendMsg from './assets/components/SendMsg';

function App() {
  const [fileData, setFileData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [exported, setExported] = useState(false);


  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = utils.sheet_to_json(worksheet, {
        header: ["ID", "APELLIDOS Y NOMBRES", "TIPO DE SERVICIO", "DIRECCION", "MONTO DE DEUDA", "NÚMERO CELULAR"],
        range: 2,
        raw: false,
      }).map((item) => ({
        id: item["ID"],
        user: item["APELLIDOS Y NOMBRES"],
        servicio: item["TIPO DE SERVICIO"],
        direccion: item["DIRECCION"],
        deuda: item["MONTO DE DEUDA"],
        celular: item["NÚMERO CELULAR"],
      }));

      setFileData(jsonData);
      setDataLoaded(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(fileData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = 'data.xlsx';

    if (navigator.msSaveBlob) {
      // Para Internet Explorer
      navigator.msSaveBlob(data, fileName);
    } else {
      const link = document.createElement('a');
      // Para navegadores modernos
      if (link.download !== undefined) {
        const url = URL.createObjectURL(data);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    setExported(true);
  };

  useEffect(() => {
    const storedData = localStorage.getItem('fileData');
    if (storedData) {
      const jsonData = JSON.parse(storedData);
      setFileData(jsonData);
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (fileData.length > 0) {
      const messages = fileData.map((data) => {
        return {
          ...data,
        };
      });
    }
  }, [fileData]);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('fileData', JSON.stringify(fileData));
    }
  }, [fileData, dataLoaded]);


  return (
    <div className='container_app'>
      <img src={logo} alt="Logo" />
      <h1>Recordatorio de pago</h1>
      <form>
        <input type="file" onChange={handleFileChange} accept=".xls, .xlsx" />
      </form>
      <div className='container_buttons'>
        <button className='button_send' >ENVIAR TODOS</button>
        {exported ? (
          <button className='button_send'>EXPORTADO</button>
        ) : (
          <button className='button_send' onClick={exportToExcel}>EXPORTAR EXCEL</button>
        )}
      </div>
      <h3>Datos cargados: {fileData.length} Clientes</h3>
      <div className='card_container'>
        {dataLoaded ? (
          fileData.map((data, index) => (
            <SendMsg key={index} data={data} />))
        ) : (
          <p>Cargando datos...</p>
        )}
      </div>
    </div>
  );
}

export default App;