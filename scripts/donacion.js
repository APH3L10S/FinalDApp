// Cargar las variables de entorno desde el archivo .env
import dotenv from 'dotenv';
dotenv.config();

// Direcciones de los contratos desde el archivo .env
const historyContractAddress = process.env.TOYDONATIONHISTORY_ADDRESS;  // Dirección del contrato de Historial
const nftContractAddress = process.env.TOYDONATIONNFT_ADDRESS;  // Dirección del contrato NFT
const multisigContractAddress = process.env.TOYDONATIONMULTISIG_ADDRESS;  // Dirección del contrato MultiSig

// Cargar la ABI desde los archivos generados por Hardhat
const walletABI = require('../artifacts/contracts/WalletMultiSig.sol/ToyDonationMultiSig.json').abi;
const historyABI = require('../artifacts/contracts/Historial.sol/ToyDonationHistory.json').abi;
const nftABI = require('../artifacts/contracts/ToyDonationNFT.sol/ToyDonationNFT.json').abi;

// Proveedor y Firmante de Ethereum
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contratos con el signer (para firmar transacciones)
const walletContract = new ethers.Contract(multisigContractAddress, walletABI, signer);
const historyContract = new ethers.Contract(historyContractAddress, historyABI, signer);
const nftContract = new ethers.Contract(nftContractAddress, nftABI, signer);

// Función para enviar una solicitud de donación de juguetes, realizar un depósito y aprobar la transacción
async function submitTransaction() {
    try {
        const donorAddress = document.getElementById('donorAddress').value;
        const privateKeyDonor = document.getElementById('privateKeyDonor').value;
        const donationAmount = document.getElementById('donationAmount').value;  // Aquí la cantidad de juguetes

        if (!donorAddress || !privateKeyDonor || !donationAmount) {
            alert('Por favor, completa todos los campos');
            return;
        }

        // Conectar wallet del donante al contrato usando la clave privada
        const wallet = new ethers.Wallet(privateKeyDonor, provider);
        const walletContractWithSigner = walletContract.connect(wallet);  // Conectar el contrato MultiSig con el signer del donante

        // Convertir la cantidad de juguetes a Wei (ajustar esto si no es en ethers)
        const weiAmount = ethers.utils.parseUnits(donationAmount, 'wei');

        // Enviar la solicitud de transferencia (Submit Transaction) al MultiSig
        console.log("Enviando solicitud de donación...");
        const transaction = await walletContractWithSigner.submitTransaction(donorAddress, weiAmount);
        const receipt = await transaction.wait();
        console.log('Solicitud de donación enviada.');

        // Obtener el ID de la transacción desde los logs
        let transactionId;
        if (receipt.logs.length > 0) {
            const iface = new ethers.utils.Interface(walletABI);
            for (const log of receipt.logs) {
                try {
                    const parsedLog = iface.parseLog(log);
                    if (parsedLog.name === 'TransactionSubmitted') {
                        transactionId = parsedLog.args.transactionId.toNumber();
                        console.log("ID de la transacción obtenida:", transactionId);
                        break;
                    }
                } catch (err) {
                    console.error('No se pudo parsear este log:', err);
                }
            }
        }

        if (transactionId === undefined) {
            alert('No se pudo obtener el ID de la transacción desde los logs. Depósito y aprobación fallidos.');
            return;
        }

        // Realizar depósito al contrato (Deposit) utilizando MultiSig
        console.log("Realizando depósito...");
        const depositTransaction = await walletContractWithSigner.deposit({ value: weiAmount });
        await depositTransaction.wait();
        console.log('Depósito realizado con éxito.');

        // Aprobar la transacción automáticamente (Approve Transaction) utilizando MultiSig
        console.log("Aprobando transacción...");
        const approveTransaction = await walletContractWithSigner.approveTransaction(transactionId);
        await approveTransaction.wait();
        console.log('Transacción aprobada automáticamente.');

        alert('Solicitud de donación, depósito y aprobación realizados correctamente.');

    } catch (error) {
        console.error('Error al enviar la transacción:', error);
        alert('Error al enviar la transacción: ' + error.message);
    }
}

async function getOwnersFromContract() {
    try {
        // Crear una instancia del contrato
        const contract = new ethers.Contract(multisigContractAddress, contractABI, signer);

        // Llamar a la función getOwners
        const owners = await contract.getOwners();

        // Mostrar los owners
        console.log('Owners del contrato:', owners);
        alert('Owners: ' + owners.join(', ')); // Puedes mostrarlo en la UI o en un modal
    } catch (error) {
        console.error('Error al obtener los owners:', error);
        alert('Error al obtener los owners: ' + error.message);
    }
}


// Función para aprobar la transacción por el receptor (paciente)
async function approveTransaction() {
    try {
        const transactionId = prompt("Introduce el ID de la transacción a aprobar:");

        if (transactionId === null || transactionId === "") {
            alert('ID de la transacción no proporcionado');
            return;
        }

        const privateKeyPatient = document.getElementById('privateKeyPatient').value;

        if (!privateKeyPatient) {
            alert('Por favor, proporciona la clave privada del receptor');
            return;
        }

        // Conectar wallet del receptor al contrato usando la clave privada
        const wallet = new ethers.Wallet(privateKeyPatient, provider);
        const walletContractWithSigner = walletContract.connect(wallet);  // Conectar el contrato MultiSig con el signer del receptor

        const approveTransaction = await walletContractWithSigner.approveTransaction(transactionId);
        await approveTransaction.wait();

        alert('Transacción aprobada por el receptor');
    } catch (error) {
        console.error('Error al aprobar la transacción:', error);
        alert('Error al aprobar la transacción: ' + error.message);
    }
}

// Función para ejecutar la transacción por el receptor
async function executeTransaction() {
    try {
        const transactionId = prompt("Introduce el ID de la transacción a ejecutar:");

        if (transactionId === null || transactionId === "") {
            alert('ID de la transacción no proporcionado');
            return;
        }

        const privateKeyPatient = document.getElementById('privateKeyPatient').value;

        if (!privateKeyPatient) {
            alert('Por favor, proporciona la clave privada del receptor');
            return;
        }

        // Conectar wallet del receptor al contrato usando la clave privada
        const wallet = new ethers.Wallet(privateKeyPatient, provider);
        const walletContractWithSigner = walletContract.connect(wallet);  // Conectar el contrato MultiSig con el signer del receptor

        // Ejecutar la transacción
        console.log("Ejecutando la transacción...");
        const executeTransaction = await walletContractWithSigner.executeTransaction(transactionId);
        await executeTransaction.wait();
        console.log('Transacción ejecutada');
        
        // Registrar en el contrato de historial de donaciones
        console.log("Registrando en el contrato de historial...");
        const recordDonation = await historyContract.recordDonation(transactionId, donorAddress, recipientAddress, weiAmount);
        await recordDonation.wait();
        console.log('Registro de donación en historial completado.');

        alert('Transacción ejecutada y registrada en el historial.');

        // Crear y enviar NFT al donante
        console.log("Creando y enviando NFT al donante...");
        const tokenURI = "https://gateway.pinata.cloud/ipfs/bafkreihp5smri7gf3rwjwxn2dzfzskqcxlcs2dir4wvcainavkjr26vwye";
        const mintNFTTransaction = await nftContract.mintNFT(donorAddress, tokenURI);
        await mintNFTTransaction.wait();
        console.log('NFT creado y enviado al donante.');

        alert('Transacción ejecutada, registrada en el historial y NFT enviado al donante.');

    } catch (error) {
        console.error('Error al ejecutar la transacción:', error);
        alert('Error al ejecutar la transacción: ' + error.message);
    }
}
