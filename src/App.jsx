import React, { useState } from 'react';
import { read, utils, write } from 'xlsx';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import './App.css';
import logo from './assets/images/logo.png';
import logoexcel from './assets/images/excel.png';

function App() {

  const [fileData, setFileData] = useState([]);
  const [exported, setExported] = useState(false);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [messagesSentCount, setMessagesSentCount] = useState(0)
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);


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
        phone: item["NÚMERO CELULAR"],
        message: `Estimado(a), ${item["APELLIDOS Y NOMBRES"]} le escribimos de JR TELECOM SAC para informarle que al día de hoy mantiene una deuda de S/ ${item["MONTO DE DEUDA"]} por el servicio de ${item["TIPO DE SERVICIO"]} en la dirección de ${item["DIRECCION"]}. Favor de realizar el pago correspondiente en nuestros centros de pago autorizados. Yape, Plin u oficina distrital a fin de evitar el corte y cargos por reconexión. En caso haya realizado el pago en los últimos días obviar el mensaje. Muchas gracias`,
      }));

      setFileData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToExcel = () => {
    const dataWithoutMessage = fileData.map(({ message, ...rest }) => rest);
    const worksheet = utils.json_to_sheet(dataWithoutMessage);
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

  const sendMessage = async (event, data) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/lead', {
        message: data.message,
        phone: data.phone,
      });

      setApiResponse(response.data);
      setLoading(false);

      if (response.data.responseExSave && response.data.responseExSave.id) {
        // Resto del código para el caso de mensaje enviado con éxito
        setMessagesSentCount((prevCount) => prevCount + 1);
        setFileData((prevFileData) => prevFileData.filter((item) => item.id !== data.id));
      } else {
        // Resto del código para el caso de error al enviar el mensaje
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  console.log(apiResponse);

  const sendAllMessages = async (event) => {
    try {
      const sendPromises = fileData.map((item) => sendMessage(event, item));
      await Promise.all(sendPromises);

      toast.success('Todos los mensajes han sido enviados');
    } catch (error) {
      console.error(error);
      toast.error('Error al enviar los mensajes');
    }
  };

  const handleMessageChange = (value, id) => {
    setFileData((prevFileData) =>
      prevFileData.map((item) =>
        item.id === id ? { ...item, message: value } : item
      )
    );
  };

  const handlePhoneChange = (value, id) => {
    setFileData((prevFileData) =>
      prevFileData.map((item) =>
        item.id === id ? { ...item, phone: value } : item
      )
    );
  };


  return (
    <main className='container_app'>
      <header className='container_header'>
        <img src={logo} alt="Logo" />
        <h1>Recordatorio de Pago</h1>
      </header>
      <form className='FileImporter'>
        <input type="file" onChange={handleFileChange} accept=".xls, .xlsx" />
      </form>
      <div className='container_buttons'>
        <button className='button_send' disabled={messageSent} onClick={sendAllMessages}>
          {messageSent ? 'Mensajes enviados' : `ENVIAR TODOS `}
        </button>

        {exported ? (
          <button className='button_send'>EXPORTADO</button>
        ) : (
          <button className='button_send' onClick={exportToExcel}>
            EXPORTAR
            <img className='logoexcel' src={logoexcel} />
          </button>
        )}
      </div>
      <h3>
        {loading ? 'Cargando datos...' : `Datos cargados: ${fileData.length} Clientes | Mensajes enviados: ${apiResponse?.data?.responseExSave?.id ? messagesSentCount + 1 : messagesSentCount} | Mensajes No Enviados: ${fileData.length - messagesSentCount}`}
      </h3>

      <div>
        <div className='card_container'>
          {fileData.map((data) => {
            if (!messageSent) {
              return (
                <div className='container__clientDetail' key={data.id}>
                  <p><b>ID:</b> {data.id}</p>
                  <p><b>APELLIDOS Y NOMBRES:</b></p>
                  <p>{data.user}</p>

                  <p><b>TIPO DE SERVICIO:</b> </p>
                  <p>{data.servicio}</p>

                  <p><b>DIRECCIÓN:</b> </p>
                  <p>{data.direccion}</p>

                  <p><b>MONTO DE DEUDA:</b></p>
                  <p>S/.{data.deuda}</p>

                  <p><b>CELULAR:</b></p>
                  <p>{data.phone}</p>

                  <p className='msg_generated'><b>MENSAJE:</b></p>
                  <p>{data.message}</p>

                  <form className='form_client' onSubmit={(event) => sendMessage(event, data)}>
                    <label>
                      <input
                        className='form_input'
                        type='text'
                        value={data.message}
                        onChange={(e) => handleMessageChange(e.target.value, data.id)}
                      />
                    </label>
                    <label>
                      <input
                        className='form_input'
                        type='text'
                        value={data.phone}
                        onChange={(e) => handlePhoneChange(e.target.value, data.id)}
                      />
                    </label>
                    <button type='submit'>ENVIAR <i className='bx bx-mail-send icon_sender' /></button>
                  </form>

                  <Toaster />
                </div>
              );
            } else {
              return null;
            }
          })}

        </div>
      </div>
    </main>
  );
}

export default App;

