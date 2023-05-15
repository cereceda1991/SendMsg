import axios from 'axios';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

function SendMsg({ data, generatedMessages }) {
    const { id, user, servicio, direccion, deuda, celular } = data;

    const [message, setMessage] = useState(generatedMessages);
    const [phone, setPhone] = useState(data.phone || '');

    const [messageSent, setMessageSent] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/lead', {
                message: message,
                phone: phone,
            });

            console.log(response.data);

            setMessage('');
            setPhone('');

            if (response.data.responseExSave && response.data.responseExSave.id) {
                toast.success('Mensaje enviado con éxito');
                setMessageSent(true);
            } else {
                toast.error('Error al enviar el mensaje');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar el mensaje');
        }
    };

    const generateMessage = (data) => {
        const { user, deuda, servicio, direccion, celular } = data;
        const generatedMessage = `Estimado(a), ${user} le escribimos de JR TELECOM SAC para informarle que al día de hoy mantiene una deuda de S/ ${deuda} por el servicio de ${servicio} en la dirección de ${direccion}. Favor de realizar el pago correspondiente en nuestros centros de pago autorizados. Yape, Plin u oficina distrital a fin de evitar el corte y cargos por reconexión. En caso haya realizado el pago en los últimos días obviar el mensaje. Muchas gracias`;

        setMessage(generatedMessage);
        setPhone(celular);
    };

    return (
        <section>
            {messageSent ? (
                <p className='mensaje_enviado'>Enviado</p>
            ) : (
                <div className='container__clientDetail'>
                    <p>
                        <b>ID:</b> {id}
                    </p>
                    <p>
                        <b>APELLIDOS Y NOMBRES:</b>
                    </p>
                    <p> {user}</p>
                    <p>
                        <b>TIPO DE SERVICIO:</b>
                    </p>
                    <p> {servicio}</p>
                    <p>
                        <b>DIRECCIÓN:</b>
                    </p>
                    <p> {direccion}</p>
                    <p>
                        <b>MONTO DE DEUDA:</b> S/.{deuda}
                    </p>
                    <p>
                        <b>CELULAR:</b> {celular}
                    </p>
                    <button onClick={() => generateMessage(data)} type='submit'>
                        Generar Mensaje
                    </button>
                    <form className='form_client' onSubmit={handleSubmit}>
                        <label>
                            <input
                                className='form_input'
                                type='text'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </label>
                        <label>
                            <input
                                className='form_input'
                                type='text'
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)} />
                        </label>
                        {message && (
                            <div className='msg_generated'>
                                <b>Mensaje generado:</b>
                                <p>{message}</p>
                            </div>
                        )}
                        <button type='submit'>
                            Enviar
                        </button>
                    </form>
                    <Toaster />
                </div>
            )}
        </section>
    );
}

export default SendMsg;