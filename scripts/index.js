const express = require("express");
const { ethers } = require("ethers");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de ethers.js
const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Direcciones de los contratos
const contratos = {
    Equipos: "direccion_del_contrato_equipos",
    Jugadores: "direccion_del_contrato_jugadores",
    NFT: "direccion_del_contrato_nft",
    Wallet: "direccion_del_contrato_wallet",
};

// ABIs de los contratos
const abiEquipos = require("./artifacts/contracts/Equipos.sol/Equipos.json").abi;
const abiJugadores = require("./artifacts/contracts/Jugadores.sol/Jugadores.json").abi;
const abiNFT = require("./artifacts/contracts/NFT.sol/NFT.json").abi;
const abiWallet = require("./artifacts/contracts/Wallet.sol/Wallet.json").abi;

// Instancias de contratos
const equiposContract = new ethers.Contract(contratos.Equipos, abiEquipos, wallet);
const jugadoresContract = new ethers.Contract(contratos.Jugadores, abiJugadores, wallet);
const nftContract = new ethers.Contract(contratos.NFT, abiNFT, wallet);
const walletContract = new ethers.Contract(contratos.Wallet, abiWallet, wallet);

// Rutas para el contrato Equipos
app.post("/equipos", async (req, res) => {
    const { nombre, logoIPFS } = req.body;
    try {
        const tx = await equiposContract.crearEquipo(nombre, logoIPFS);
        await tx.wait();
        res.json({ message: "Equipo creado con éxito", txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/equipos/:id/jugadores", async (req, res) => {
    const { id } = req.params;
    const { jugador } = req.body;
    try {
        const tx = await equiposContract.agregarJugador(id, jugador);
        await tx.wait();
        res.json({ message: "Jugador agregado al equipo", txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/equipos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const equipo = await equiposContract.obtenerEquipo(id);
        res.json(equipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rutas para el contrato Jugadores
app.post("/jugadores", async (req, res) => {
    const { id, nombre, nickname, rol, nacionalidad, imagenIPFS } = req.body;
    try {
        const tx = await jugadoresContract.registrarJugador(id, nombre, nickname, rol, nacionalidad, imagenIPFS);
        await tx.wait();
        res.json({ message: "Jugador registrado con éxito", txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/jugadores/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const jugador = await jugadoresContract.obtenerJugador(id);
        res.json(jugador);
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
        const tx = await walletContract.submitTransaction(to, ethers.utils.parseEther(amount));
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
