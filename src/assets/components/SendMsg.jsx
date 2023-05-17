// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import toast, { Toaster } from 'react-hot-toast';

// function SendMsg({ }) {

//     return (
//         <section>
//             {messageSent ? (
//                 <p className='mensaje_enviado'>Enviado</p>
//             ) : (
//                 <div className='container__clientDetail'>
//                     <p>
//                         <b>ID:</b> {id}
//                     </p>
//                     <p>
//                         <b>APELLIDOS Y NOMBRES:</b>
//                     </p>
//                     <p> {user}</p>
//                     <p>
//                         <b>TIPO DE SERVICIO:</b>
//                     </p>
//                     <p> {servicio}</p>
//                     <p>
//                         <b>DIRECCIÓN:</b>
//                     </p>
//                     <p> {direccion}</p>
//                     <p>
//                         <b>MONTO DE DEUDA:</b> S/.{deuda}
//                     </p>
//                     <p>
//                         <b>CELULAR:</b> {celular}
//                     </p>
//                     <form className='form_client' onSubmit={sendMessage}>
//                         <label>
//                             <input
//                                 className='form_input'
//                                 type='text'
//                                 value={message}
//                                 onChange={(e) => setMessage(e.target.value)}
//                             />
//                         </label>
//                         <label>
//                             <input
//                                 className='form_input'
//                                 type='text'
//                                 value={phone}
//                                 onChange={(e) => setPhone(e.target.value)} />
//                         </label>
//                         {message && (
//                             <div className='msg_generated'>
//                                 <b>Mensaje generado:</b>
//                                 <p>{message}</p>
//                             </div>
//                         )}
//                         <button type='submit'>
//                             Enviar
//                         </button>
//                     </form>
//                     <Toaster />
//                 </div>
//             )}
//         </section>
//     );
// }

// export default SendMsg;