const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Etherscan API
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; // Asegúrate de que esta línea esté correctamente configurada
const SOLIDITY_VERSION = 'v0.8.27'; // Versión de Solidity 0.8.27
const etherscanUrl = 'https://api-sepolia.etherscan.io/api'; // URL correcta de la API de Sepolia

// Ruta a los archivos generados por Hardhat
const CONTRACTS_DIR = path.join(__dirname, 'contracts'); // Cambiar a 'contracts', no 'artifacts'

// Función para leer la ABI de un contrato
function getABI(contractName) {
    const contractPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
    return contractJson.abi;
}

// Función para leer el código fuente de un contrato
function getContractSource(contractName) {
    const contractPath = path.join(CONTRACTS_DIR, `${contractName}.sol`); // Leer desde 'contracts/'
    return fs.readFileSync(contractPath, 'utf-8');
}

// Función para verificar el contrato en Etherscan
async function verifyContract(contractAddress, contractSource, contractName, abi) {
    const data = {
        module: 'contract',
        action: 'verifysourcecode',
        apiKey: ETHERSCAN_API_KEY,
        contractAddress: contractAddress,
        sourceCode: contractSource,
        contractName: contractName,
        compilerVersion: SOLIDITY_VERSION, // Usar v0.8.27
        optimizationUsed: 0, // Establecer 1 si usaste optimización
        runs: 200, // Número de optimizaciones (200 es común)
        constructorArguments: '', // Argumentos del constructor (si los tienes)
        abi: JSON.stringify(abi) // ABI en formato JSON
    };

    try {
        const response = await axios.post(etherscanUrl, data); // Usar la URL correcta
        console.log(`Verificación del contrato ${contractName}: `, response.data);
        if (response.data.status === '1') {
            console.log(`${contractName} verificado exitosamente`);
        } else {
            console.log(`Error al verificar ${contractName}: ${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error al hacer la solicitud a Etherscan para ${contractName}:`, error.message);
    }
}

// Lista de contratos que deseas verificar
const contracts = [
    { name: 'NFTJugador', address: '0x5FbDB2315678afecb367f032d93F642f64180aa3' },
    { name: 'Usuarios', address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' },
    { name: 'Historial', address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' },
    { name: 'Wallet', address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' }
];

// Verificar todos los contratos
async function verifyAllContracts() {
    for (const contract of contracts) {
        const abi = getABI(contract.name); // Obtener ABI
        const sourceCode = getContractSource(contract.name); // Obtener código fuente
        await verifyContract(contract.address, sourceCode, contract.name, abi);
    }
}

// Ejecutar la verificación
verifyAllContracts();
