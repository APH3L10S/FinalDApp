const hre = require("hardhat");

async function main() {
  // Desplegar el contrato NFTJugador (NFTs de los jugadores)
  const NFTJugador = await hre.ethers.getContractFactory("NFTJugador");
  const nftJugador = await NFTJugador.deploy();  // Asegúrate de que no falten parámetros en el constructor
  await nftJugador.deployed();
  console.log(`Contrato NFTJugador desplegado en: ${nftJugador.address}`);

  // Desplegar el contrato Usuarios (no necesita parámetros en el constructor)
  const Usuarios = await hre.ethers.getContractFactory("Usuarios");
  const usuarios = await Usuarios.deploy();  // No necesita parámetros en el constructor
  await usuarios.deployed();
  console.log(`Contrato Usuarios desplegado en: ${usuarios.address}`);

  // Desplegar el contrato Historial
  const Historial = await hre.ethers.getContractFactory("Historial");
  const historial = await Historial.deploy();  // Asegúrate de que el contrato no requiera parámetros o pasa los necesarios
  await historial.deployed();
  console.log(`Contrato Historial desplegado en: ${historial.address}`);

  // Desplegar el contrato Wallet (Wallet Multifirma)
  const Wallet = await hre.ethers.getContractFactory("Wallet");

  // Definir las direcciones de los propietarios y el número de confirmaciones necesarias
  const owners = [
    "0x9C55a48A1Bd4cac888f2147af8915845CDEcb062",
    "0xDB303608363F03B24E8Fb1F3f22B34C734F32dFe"
  ];
  const numConfirmationsRequired = 2; // Número de confirmaciones necesarias para aprobar una transacción

  const wallet = await Wallet.deploy(owners, numConfirmationsRequired);
  await wallet.deployed();
  console.log(`Contrato Wallet desplegado en: ${wallet.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//Martes, 12 de Noviembre de 2024 - DEPLOY DEL ULTIMO CONTRATO WalletMultiSig (Wallet MultiFirma)
//(Al momento de ejecutar, comentar el código anterior de deploy)
/*async function multiDeploy() {
    const owners = ["", ""] //Colocar las direcciones públicas de dos cuentas
    //En un equipo debemos tener dos cuentas (una por integrante)
    const requiredApprovals = 2;
    const WalletMultiSig = await ethers.getContractFactory("WalletMultiSig"); //Nombre del contrato
    const wallet = await WalletMultiSig.deploy(owners, requiredApprovals); //Parámetros del constructor
    console.log("WalletMultiSig deployed to: ",wallet.address); //Dirección del contrato
}

multiDeploy()
.then(()=>process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})*/
