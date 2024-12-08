const hre = require("hardhat");

async function main() {
  // Desplegar el contrato NFTs
  const NFTs = await hre.ethers.getContractFactory("NFT");
  const nfts = await NFTs.deploy();
  await nfts.deployed();
  console.log(`Contrato NFTs desplegado en: ${nfts.address}`);

  // Desplegar el contrato Jugadores
  const Jugadores = await hre.ethers.getContractFactory("Jugadores");
  const jugadores = await Jugadores.deploy(nfts.address); //Pasar dirección del contrato de NFTs [07-12-2024]
  await jugadores.deployed();
  console.log(`Contrato Jugadores desplegado en: ${jugadores.address}`);

  // Desplegar el contrato Equipos
  const Equipos = await hre.ethers.getContractFactory("Equipos");
  const equipos = await Equipos.deploy(nfts.address, jugadores.address); //Pasar dirección del contrato de NFTs [07-12-2024]
  await equipos.deployed();
  console.log(`Contrato Equipos desplegado en: ${equipos.address}`);

/*
  // Desplegar el contrato Wallet
  const Wallet = await hre.ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy();
  await wallet.deployed();
  console.log(`Contrato Wallet desplegado en: ${wallet.address}`);
  */
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
