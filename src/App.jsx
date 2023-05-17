import './App.css';
import { read, utils, write } from 'xlsx';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import logo from './assets/images/logo.png';
import logoexcel from './assets/images/excel.png'

function App() {

  const [fileData, setFileData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [exported, setExported] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState({});
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [messagesSentCount, setMessagesSentCount] = useState(0)
  const [loading, setLoading] = useState(false);

  const [sentUsers, setSentUsers] = useState(false)


  const generateMessage = (data) => {
    const { id, user, deuda, servicio, direccion, celular } = data;
    const generatedMessage = `Estimado(a), ${user} le escribimos de JR TELECOM SAC para informarle que al día de hoy mantiene una deuda de S/ ${deuda} por el servicio de ${servicio} en la dirección de ${direccion}. Favor de realizar el pago correspondiente en nuestros centros de pago autorizados. Yape, Plin u oficina distrital a fin de evitar el corte y cargos por reconexión. En caso haya realizado el pago en los últimos días obviar el mensaje. Muchas gracias`;

    setGeneratedMessage((prevState) => ({
      ...prevState,
      [id]: generatedMessage,
    }));

    return generatedMessage;
  }



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

      if (jsonData.length > 0) {
        const firstData = jsonData[0];
        generateMessage(firstData);
      }
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

  const sendMessage = async (event, data) => {
    event.preventDefault();
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await axios.post('http://localhost:3001/lead', {
        message: generatedMessage[data.id - 1],
        phone: data.celular,
      });
      console.log(response.data);
      setMessage('');
      setPhone('');

      if (response.data.responseExSave && response.data.responseExSave.id) {
        toast.success('Mensaje enviado con éxito');
        setMessageSent(true);
        setMessagesSentCount((prevCount) => prevCount + 1);
      } else {
        toast.error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al enviar el mensaje');
    }
  };


  const sendAllMessages = () => {
    fileData.forEach((data) => {
      const event = { preventDefault: () => { } };
      sendMessage(event, data);
    });
  };


  useEffect(() => {
    if (fileData.length > 0) {
      const generatedMessages = fileData.map((data) => generateMessage(data));
      setGeneratedMessage(generatedMessages);
    }
  }, [fileData]);


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
        {loading ? 'Cargando datos...' : `Datos cargados: ${fileData.length} Clientes | Mensajes enviados: ${messagesSentCount} | Mensajes No Enviados: ${fileData.length - messagesSentCount}`}
      </h3>
      <div>
        <div className='card_container'>
          {fileData.map((data) => (
            <div className='container__clientDetail' key={data.id}>

              <p>
                <b>ID:</b> {data.id}
              </p>
              <p><b>APELLIDOS Y NOMBRES:</b> </p>
              <p>{data.user}</p>

              <p><b>TIPO DE SERVICIO:</b> </p>
              <p>{data.servicio}</p>

              <p><b>DIRECCIÓN:</b> </p>
              <p>{data.direccion}</p>

              <p><b>MONTO DE DEUDA:</b></p>
              <p>S/.{data.deuda}</p>

              <p><b>CELULAR:</b></p>
              <p>{data.celular}</p>

              <form className='form_client' onSubmit={(event) => sendMessage(event, data)}>
                <label>
                  <input
                    className='form_input'
                    type='text'
                    value={generatedMessage[data.id - 1]}
                    onChange={(e) => handleMessageChange(e.target.value, data)}
                  />
                </label>
                <label>
                  <input
                    className='form_input'
                    type='text'
                    value={data.celular}
                    onChange={(e) => handlePhoneChange(e.target.value, data)}
                  />
                </label>
                {generatedMessage[data.id - 1] && (
                  <div className='msg_generated'>
                    <b>MENSAJE:</b>
                    <p>{generatedMessage[data.id - 1]}</p>
                  </div>
                )}
                <button type='submit'>ENVIAR <i class='bx bx-mail-send icon_sender' /></button>
              </form>
              <Toaster />
            </div>
          ))}
        </div>


      </div>
    </main>
  );
}

export default App;
