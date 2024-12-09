const express = require("express");
const { ethers } = require("ethers");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer"); //Manejo de imagenes con Multer [06-12-2024 - REQUIRIMIENTOS DE APLICACION]
//Permitir el envio y almacenamiento de imagenes de equipos y jugadores, subiendolas a Pinata para almacenamiento en IPFS.
const FormData = require("form-data"); //[07-12-2024]
const fs = require("fs"); //[06-12-2024 - REQUERIMIENTOS DE APLICACION]
//require("dotenv").config(); //[07-12-2024: COMENTADO]
require("dotenv").config({ path: require("find-config")(".env") }); //[07-12-2024: Servidor corriendo]

//[07-12-2024: Servidor corriendo]
const {
  PRIVATE_KEY,
  API_URL,
  PUBLIC_KEY,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
  NFT_ADDRESS,
  JUGADORES_ADDRESS,
  EQUIPOS_ADDRESS,
} = process.env;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de Multer para manejo de imágenes [06-12-2024: REQUERIMIENTOS DE APLICACION]
const upload = multer({ dest: "uploads/" }); //Carpeta temporal "uploads" ubicada en scripts

// Configuración de ethers.js
const provider = new ethers.providers.JsonRpcProvider(API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Direcciones de los contratos
const contratos = {
  Equipos: EQUIPOS_ADDRESS,
  Jugadores: JUGADORES_ADDRESS,
  NFT: NFT_ADDRESS,
  //Wallet: process.env.WALLET_ADDRESS,
};

// ABIs de los contratos
const abiEquipos =
  require("../artifacts/contracts/Equipos.sol/Equipos.json").abi;
const abiJugadores =
  require("../artifacts/contracts/Jugadores.sol/Jugadores.json").abi;
const abiNFT = require("../artifacts/contracts/NFT.sol/NFT.json").abi;
//const abiWallet = require("../artifacts/contracts/Wallet.sol/Wallet.json").abi;

// Instancias de contratos
const equiposContract = new ethers.Contract(
  contratos.Equipos,
  abiEquipos,
  wallet
);
const jugadoresContract = new ethers.Contract(
  contratos.Jugadores,
  abiJugadores,
  wallet
);
const nftContract = new ethers.Contract(contratos.NFT, abiNFT, wallet);
//const walletContract = new ethers.Contract(contratos.Wallet, abiWallet, wallet);

//Función para subir imagenes a Pinata [06-12-2024: REQUERIMIENTOS DE APLICACION]
async function subirImagenAPinata(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  if (!fs.existsSync(filePath)) {
    throw new Error("El archivo no existe en la ruta especificada.");
  }

  const formData = new FormData();

  //Verifica que el archivo existe en esa ubicación antes de llamar a fs.createReadStream
  //File Path: uploads\950249f1edb3bb10e45068986c45db27
  console.log("File Path:", filePath);
  //File Exists: true
  console.log("File Exists:", fs.existsSync(filePath));

  //const readStream = fs.createReadStream(filePath);
  //console.log("Is ReadStream:", readStream instanceof fs.ReadStream); // Verifica si es un ReadStream

  formData.append("file", fs.createReadStream(filePath)); // Asegurar de que filePath es válido

  const metadata = JSON.stringify({ name: "Imagen" });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 0 });
  formData.append("pinataOptions", options);

  //console.log("Form Data (File):", formData.getHeaders()); // Verifica si el archivo se adjuntó correctamente
  //console.log("Content-Type:", formData.getHeaders()["content-type"]); // Muestra el Content-Type

  //Verifica que formData contiene los datos correctos antes de enviar la solicitud:
  //console.log("Form Data:", formData); // Esto imprimirá los datos adjuntos en el formulario

  //console.log("Content-Type:", `multipart/form-data; boundary=${formData._boundary}`);

  const headers = {
    ...formData.getHeaders(),
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_KEY,
  };

  console.log("Form Data Headers:", headers); // Muestra encabezados con boundary

  try {
    //console.log("Content-Type:", `multipart/form-data; boundary=${formData._boundary}`);
    const response = await axios.post(url, formData, {
      headers,
      /*maxContentLength: "Infinity",
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },*/
    });
    //fs.unlinkSync(filePath); // Eliminar el archivo solo si la solicitud fue exitosa
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error al subir imagen a Pinata:", error.message);
    throw new Error("No se pudo subir la imagen a Pinata");
  } /*finally {
            //Asegurar la eliminación del archivo temporal
            fs.unlinkSync(filePath);
        }*/
}

// Rutas para el contrato Equipos
//Crear Equipo CON NFT - RUTA MODIFICADA [06-12-2024: REQUERIMIENTOS DE APLICACION]
app.post("/equipos", upload.single("logo"), async (req, res) => {
  const { idEquipo, nombre, nftMetaData, nftId } = req.body; //CAMBIO MAS RECIENTE - 06-12-2024
  const logoPath = req.file.path;
  //const { nombre, logoIPFS } = req.body;
  try {
    //SUBIR IMAGEN A PINATA [06-12-2024]
    const logoIPFS = await subirImagenAPinata(logoPath);
    fs.unlinkSync(logoPath);

    //CREAR EQUIPO
    const tx = await equiposContract.crearEquipo(
      idEquipo,
      nombre,
      logoIPFS,
      nftId
    );
    await tx.wait();

    //ACUÑAR/MINAR NFT PARA EL EQUIPO [CAMBIO MAS RECIENTE: 06-12-2024]
    const nftTx = await nftContract.mintColeccionable(
      wallet.address,
      nftMetaData,
      idEquipo
    ); //EDITAR
    //const nftTx = await nftContract.mintColeccionable(wallet.address, nftMetaData);
    await nftTx.wait();

    //CAMBIO MAS RECIENTE: 06-12-2024
    res.json({
      message: "Equipo creado con éxito y NFT minado",
      nombre,
      nftId,
      idEquipo,
      logoIPFS,
      txHash: tx.hash,
      nftTxHash: nftTx.hash,
    });
    //res.json({ message: "Equipo creado con éxito", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//CONSULTAR EQUIPOS REGISTRADOS [06-12-2024: REQUERIMIENTOS DE APLICACION]
//RUTA MODIFICADA - TRAE LA INFORMACION DEL EQUIPO Y LOS JUGADORES ASOCIADOS
app.get("/equipos/:idEquipo", async (req, res) => {
  //const { idEquipo } = req.params;
  const idEquipo = parseInt(req.params.idEquipo, 10); // convertirlo a número
  console.log(idEquipo);

  try {
    const equipo = await equiposContract.consultarEquipo(idEquipo);
    /*const jugadores = equipo.jugadores.map(async (jugadorId) => {
                return await jugadoresContract.obtenerJugador(jugadorId);
            });*/

    res.json({
      idEquipo: equipo[0],
      nombre: equipo[1],
      logoIPFS: equipo[2],
      jugadores: equipo[3],
      nftId: equipo[4],
    });
    //res.json({ equipo, jugadores: await Promise.all(jugadores) });
    // res.json(equipo); //CODIGO ANTERIOR
  } catch (error) {
    console.error("Error al consultar equipo:", error);
    if (error.code === "CALL_EXCEPTION") {
      res
        .status(404)
        .json({ error: "El equipo no existe o no se pudo encontrar" });
    } else {
      res.status(500).json({ error: error.message });
    }
    //res.status(500).json({ error: error.message });
  }
});

//NUEVA RUTA - ELIMINAR EQUIPO [06-12-2024 (CAMBIO MAS RECIENTE): REQUERIMIENTOS DE APLICACION]
app.delete("/equipos/:idEquipo", async (req, res) => {
  const { idEquipo } = req.params; //ID DEL EQUIPO

  try {
    // Verificar y eliminar jugadores del equipo
    /*const equipo = await equiposContract.obtenerEquipo(id);

            for (const jugadorId of equipo.jugadores) {
                await jugadoresContract.eliminarJugador(jugadorId); //Eliminar jugador de un equipo en base a su ID
            }*/

    // Eliminar el equipo
    const tx = await equiposContract.eliminarEquipo(idEquipo);
    await tx.wait();

    res.json({
      message: "Equipo y jugadores eliminados con éxito",
      txHash: tx.hash,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para el contrato Jugadores
//Registrar Jugadores CON NFT - RUTA MODIFICADA [06-12-2024: REQUERIMIENTOS DE APLICACION]
app.post("/jugadores", upload.single("imagen"), async (req, res) => {
  const {
    idJugador,
    nombre,
    nickname,
    rol,
    nacionalidad,
    equipoId,
    nftMetaData,
    nftId,
  } = req.body; //[CAMBIO MAS RECIENTE - 06-12-2024]
  //const { id, nombre, nickname, rol, nacionalidad, equipoId } = req.body; //[06-12-2024]
  const imagenPath = req.file.path;
  //const { id, nombre, nickname, rol, nacionalidad, imagenIPFS } = req.body; //CODIGO ORIGINAL

  try {
    //SUBIR IMAGEN A PINATA [06-12-2024]
    const imagenIPFS = await subirImagenAPinata(imagenPath);
    fs.unlinkSync(imagenPath);

    //REGISTRAR JUGADOR
    const tx = await jugadoresContract.registrarJugador(
      idJugador,
      nombre,
      nickname,
      rol,
      nacionalidad,
      imagenIPFS,
      equipoId,
      nftId
    );
    await tx.wait();

    //ACUÑAR/MINAR NFT PARA EL JUGADOR [CAMBIO MAS RECIENTE: 06-12-2024]
    const nftTx = await nftContract.mintReconocimiento(
      wallet.address,
      nftMetaData,
      equipoId
    );
    await nftTx.wait();

    //ASOCIAR JUGADOR A UN EQUIPO [06-12-2024]
    //Al crear un jugador, asociarlos a un equipo
    if (equipoId) {
      const txEquipo = await equiposContract.agregarJugador(
        equipoId,
        idJugador
      ); //ID DE EQUIPO Y ID DE JUGADOR
      await txEquipo.wait();
    }
    res.json({
      message: "Jugador registrado con éxito y NFT minado",
      imagenIPFS,
      txHash: tx.hash,
      nftTxHash: nftTx.hash,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//CONSULTAR JUGADORES REGISTRADOS [06-12-2024: REQUERIMIENTOS DE APLICACION]
//RUTA MODIFICADA - TRAE LA INFORMACION DEL JUGADOR Y LOS EQUIPOS DONDE ESTA ASOCIADO
app.get("/jugadores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const jugador = await jugadoresContract.obtenerJugador(id);
    //Buscar equipos donde esté asociado [06-12-2024]
    const equipos = [];
    const totalEquipos = await equiposContract.totalEquipos();

    for (let i = 0; i < totalEquipos; i++) {
      const equipo = await equiposContract.obtenerEquipo(i);
      if (equipo.jugadores.includes(id)) {
        equipos.push({ equipoId: i, ...equipo }); //POSIBLE ERROR
      }
    }
    res.json({ jugador, equipos }); //[06-12-2024]
    // res.json(jugador); //CODIGO ANTERIOR
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//NUEVA RUTA - ELIMINAR JUGADOR [06-12-2024 (CAMBIO MAS RECIENTE): REQUERIMIENTOS DE APLICACION]
app.delete("/jugadores/:id", async (req, res) => {
  const { id } = req.params; //ID DEL JUGADOR

  try {
    const tx = await jugadoresContract.eliminarJugador(id); //ELIMINAR JUGADOR DENTRO DE UN CONTRATO EN BASE A SU ID
    await tx.wait();

    res.json({ message: "Jugador eliminado con éxito", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para el contrato NFT
app.post("/nft", async (req, res) => {
  const { to, metadata } = req.body;
  try {
    const tx = await nftContract.mint(to, metadata);
    await tx.wait();
    res.json({ message: "NFT acuñado con éxito", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/nft/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const metadata = await nftContract.getMetadata(id);
    res.json({ metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para el contrato Wallet
app.post("/wallet/submit", async (req, res) => {
  const { to, amount } = req.body;
  try {
    const tx = await walletContract.submitTransaction(
      to,
      ethers.utils.parseEther(amount)
    );
    await tx.wait();
    res.json({ message: "Transacción creada con éxito", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/wallet/approve", async (req, res) => {
  const { transactionId } = req.body;
  try {
    const tx = await walletContract.approveTransaction(transactionId);
    await tx.wait();
    res.json({ message: "Transacción aprobada con éxito", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/wallet/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await walletContract.getTransaction(id);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/wallet/transactions", async (req, res) => {
  try {
    const count = await walletContract.getTransactionCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
});
