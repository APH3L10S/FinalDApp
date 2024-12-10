const express = require("express");
const { ethers } = require("ethers");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer"); // Manejo de imágenes con Multer
const FormData = require("form-data"); 
const fs = require("fs"); // Manejo de archivos
require("dotenv").config({ path: require("find-config")(".env") }); 

// Cargar las variables de entorno
const {
  PRIVATE_KEY,
  API_URL,
  PUBLIC_KEY,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
  NFT_ADDRESS,
  JUGADORES_ADDRESS,
  EQUIPOS_ADDRESS,
  WALLET_ADDRESS,
} = process.env;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de Multer para manejo de imágenes
const upload = multer({ dest: "uploads/" });

// Configuración de ethers.js
const provider = new ethers.providers.JsonRpcProvider(API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Direcciones de los contratos
const contratos = {
  Equipos: EQUIPOS_ADDRESS,
  Jugadores: JUGADORES_ADDRESS,
  NFT: NFT_ADDRESS,
  Wallet: WALLET_ADDRESS,
};

// ABIs de los contratos
const abiEquipos = require("../artifacts/contracts/Equipos.sol/Equipos.json").abi;
const abiJugadores = require("../artifacts/contracts/Jugadores.sol/Jugadores.json").abi;
const abiNFT = require("../artifacts/contracts/NFT.sol/NFT.json").abi;
const abiWallet = require("../artifacts/contracts/Wallet.sol/Wallet.json").abi;

// Instancias de contratos
const equiposContract = new ethers.Contract(contratos.Equipos, abiEquipos, wallet);
const jugadoresContract = new ethers.Contract(contratos.Jugadores, abiJugadores, wallet);
const nftContract = new ethers.Contract(contratos.NFT, abiNFT, wallet);
const walletContract = new ethers.Contract(contratos.Wallet, abiWallet, wallet);

// Función para subir imágenes a Pinata
async function subirImagenAPinata(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  if (!fs.existsSync(filePath)) {
    throw new Error("El archivo no existe en la ruta especificada.");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath)); // Asegurar de que filePath es válido

  const metadata = JSON.stringify({ name: "Imagen" });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 0 });
  formData.append("pinataOptions", options);

  const headers = {
    ...formData.getHeaders(),
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_KEY,
  };

  try {
    const response = await axios.post(url, formData, { headers });
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error al subir imagen a Pinata:", error.message);
    throw new Error("No se pudo subir la imagen a Pinata");
  }
}

// Rutas para el contrato Equipos
app.post("/equipos", upload.single("logo"), async (req, res) => {
  const { nombre, nftMetaData } = req.body; 
  const logoPath = req.file.path;

  try {
    const logoIPFS = await subirImagenAPinata(logoPath);
    fs.unlinkSync(logoPath); // Eliminar archivo temporal después de subirlo

    // Crear equipo
    const tx = await equiposContract.crearEquipo(nombre, logoIPFS);
    await tx.wait();

    // Acuñar NFT para el equipo
    const nftTx = await nftContract.mintColeccionable(wallet.address, nftMetaData, nombre); 
    await nftTx.wait();

    res.json({
      message: "Equipo creado con éxito y NFT minado",
      nombre,
      logoIPFS,
      txHash: tx.hash,
      nftTxHash: nftTx.hash,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consultar equipos registrados
app.get("/equipos/:idEquipo", async (req, res) => {
  const idEquipo = parseInt(req.params.idEquipo, 10);

  try {
    const equipo = await equiposContract.consultarEquipo(idEquipo);
    res.json({
      idEquipo: equipo[0],
      nombre: equipo[1],
      logoIPFS: equipo[2],
      nftId: equipo[3],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar equipo
app.delete("/equipos/:idEquipo", async (req, res) => {
  const { idEquipo } = req.params;

  try {
    const tx = await equiposContract.eliminarEquipo(idEquipo);
    await tx.wait();
    res.json({ message: "Equipo eliminado con éxito", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas para el contrato Jugadores
app.post("/jugadores", upload.single("imagen"), async (req, res) => {
  const {
    idJugador,
    nombre,
    nickname,
    rol,
    nacionalidad,
    equipoId,
    nftMetaData,
  } = req.body;
  const imagenPath = req.file.path;

  try {
    const imagenIPFS = await subirImagenAPinata(imagenPath);
    fs.unlinkSync(imagenPath);

    // Registrar jugador
    const tx = await jugadoresContract.registrarJugador(
      idJugador,
      nombre,
      nickname,
      rol,
      nacionalidad,
      imagenIPFS,
      equipoId
    );
    await tx.wait();

    // Acuñar NFT para el jugador
    const nftTx = await nftContract.mintReconocimiento(wallet.address, nftMetaData, equipoId);
    await nftTx.wait();

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

// Consultar jugadores registrados
app.get("/jugadores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const jugador = await jugadoresContract.obtenerJugador(id);
    res.json({ jugador });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar jugador
app.delete("/jugadores/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const tx = await jugadoresContract.eliminarJugador(id);
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

// Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
});
