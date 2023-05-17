// const sendMessage = async (event, data) => {
//   event.preventDefault();
//   try {
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     const response = await axios.post('http://localhost:3001/lead', {
//       message: data.message,
//       phone: data.phone,
//     });
//     console.log(response.data);
//     setMessage('');
//     setPhone('');

//     if (response.data.responseExSave && response.data.responseExSave.id) {
//       toast.success('Mensaje enviado con éxito');
//       setMessageSent(true);
//       setMessagesSentCount((prevCount) => prevCount + 1);
//     } else {
//       toast.error('Error al enviar el mensaje');
//       setSentUsers((prevSentUsers) => [...prevSentUsers, data]);
//       console.log(sentUsers);
//     }
//   } catch (error) {
//     console.error(error);
//     toast.error('Error al enviar el mensaje');
//   }
// };
