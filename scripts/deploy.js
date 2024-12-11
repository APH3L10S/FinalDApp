require("dotenv").config();
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  // Desplegar el contrato DonacionesDeJuguetes (ControlUsuarios.sol)
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con la cuenta:", deployer.address);

  // Desplegar el contrato DonacionesDeJuguetes (ControlUsuarios.sol)
  // const DonacionesDeJuguetes = await ethers.getContractFactory("DonacionesDeJuguetes");
  // const donacionesDeJuguetes = await DonacionesDeJuguetes.deploy();
  // console.log("Contrato DonacionesDeJuguetes desplegado en:", donacionesDeJuguetes.address);

  // // Desplegar el contrato ToyDonationNFT.sol
  // const ToyDonationNFT = await ethers.getContractFactory("ToyDonationNFT");
  // const toyDonationNFT = await ToyDonationNFT.deploy();
  // console.log("Contrato ToyDonationNFT desplegado en:", toyDonationNFT.address);

  // // Desplegar el contrato ToyDonationHistory.sol (Historial.sol)
  // const ToyDonationHistory = await ethers.getContractFactory("ToyDonationHistory");
  // const toyDonationHistory = await ToyDonationHistory.deploy();
  // console.log("Contrato ToyDonationHistory desplegado en:", toyDonationHistory.address);

  // Desplegar el contrato WalletMultiSig.sol
  const owners = [deployer.address, "0x71a185DDb83c8672a3A73F72Bd7A3d6B993C1A89"]; // Agrega las direcciones de los dueños aquí
  const requiredApprovals = 2;
  const walletMultiSig = await ethers.getContractFactory("ToyDonationMultiSig");
  const deployedWalletMultiSig = await walletMultiSig.deploy(owners, requiredApprovals, '0x937D4654CE54b392655C4FF4b2415e60F4A9A02b');
  console.log("Contrato ToyDonationMultiSig desplegado en:", deployedWalletMultiSig.address);

  // // Guardar las direcciones en el archivo .env
  // updateEnvFile(toyDonationNFT.address, donacionesDeJuguetes.address, toyDonationHistory.address, deployedWalletMultiSig.address);
}

// Función para actualizar el archivo .env
function updateEnvFile(NFTAddress, UsuariosAddress, HistorialAddress, WalletAddress) {
  const envFile = `
  TOYDONATIONNFT_ADDRESS='${NFTAddress}'
  DONACIONESDEJUGUETES_ADDRESS='${UsuariosAddress}'
  TOYDONATIONHISTORY_ADDRESS='${HistorialAddress}'
  TOYDONATIONMULTISIG_ADDRESS='${WalletAddress}'
  `;
  fs.writeFileSync(".env", envFile);
  console.log("Las direcciones de los contratos se han actualizado en .env");
}

// Ejecutar el script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
