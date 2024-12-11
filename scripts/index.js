let contract;
let clavePublica;
let contractHistory;
import dotenv from "dotenv";
dotenv.config();

// Obtener la dirección pública y contrato almacenado después del inicio de sesión
document.addEventListener("DOMContentLoaded", async function () {
  const almacenClavePublica = localStorage.getItem("clavePublica");
  const direccionContrato = localStorage.getItem("direccionContrato");
  const direccionContratoHistorial = process.env.TOYDONATIONHISTORY_ADDRESS; // Dirección del contrato de historial de donaciones

  if (almacenClavePublica && direccionContrato) {
    clavePublica = almacenClavePublica;

    // ABI del contrato de Donación de Juguetes
    const contractABI =
      require("../artifacts/contracts/ToyDonationNFT.sol/ToyDonationNFT.json").abi;

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    contract = new ethers.Contract(direccionContrato, contractABI, signer);

    // Contrato del historial de donaciones de juguetes
    const historyABI =
      require("../artifacts/contracts/Historial.sol/ToyDonationHistory.json").abi;

    contractHistory = new ethers.Contract(
      direccionContratoHistorial,
      historyABI,
      signer
    );

    // Llamar a buscarUsuario para verificar el tipo de usuario y habilitar el botón de donación
    const usuario = await contract.buscarUsuario(clavePublica);
    const tipoUsuario = usuario[4];

    if (tipoUsuario && tipoUsuario.toLowerCase() === "donante") {
      document.getElementById("donarButton").disabled = false;
    }
  }
});

// Función para mostrar el historial de donaciones
async function mostrarHistorial() {
  try {
    if (!clavePublica || !contractHistory) {
      alert(
        "No se encontraron credenciales del usuario. Inicia sesión primero."
      );
      return;
    }

    // Llamada al contrato para obtener el historial de donaciones del usuario
    const donations = await contractHistory.getDonationHistoryByAddress(
      clavePublica
    );

    let historialHtml =
      "<h2 class='text-4xl font-bold text-center text-blue-600 mb-6'>Historial de Donaciones de Juguetes</h2>";

    // Contenedor para las donaciones
    historialHtml +=
      "<div class='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>";

    donations.forEach((donation) => {
      historialHtml += `
        <div class='bg-white shadow-lg rounded-lg p-6'>
          <h3 class='text-xl font-semibold text-blue-700 mb-2'>ID Transacción: #${
            donation.transactionId
          }</h3>
          <p class='text-md text-gray-700 mb-2'><strong>Donante:</strong> ${
            donation.donor
          }</p>
          <p class='text-md text-gray-700 mb-2'><strong>Receptor:</strong> ${
            donation.recipient
          }</p>
          <p class='text-md text-gray-700 mb-2'><strong>Cantidad de Juguetes:</strong> ${
            donation.amount
          }</p>
          <p class='text-md text-gray-700 mb-4'><strong>Fecha:</strong> ${new Date(
            donation.timestamp * 1000
          ).toLocaleString()}</p>
          
          <!-- Botón con estilo -->
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-2 transition duration-300 ease-in-out transform hover:scale-105">
            Ver Detalles
          </button>
        </div>
      `;
    });

    historialHtml += "</div>"; // Cierre del contenedor

    // Colocar el HTML en el contenedor
    document.getElementById("content").innerHTML = historialHtml;
    document.getElementById("content").classList.remove("hidden");
    document.getElementById("perfilUsuario").classList.add("hidden");
  } catch (error) {
    console.error(
      "Error al intentar obtener el historial de donaciones:",
      error
    );
    alert("Hubo un problema al obtener el historial de donaciones.");
  }
}

async function mostrarPerfil() {
  try {
    if (!clavePublica || !contract) {
      alert(
        "No se encontraron credenciales del usuario. Inicia sesión primero."
      );
      return;
    }

    const usuario = await contract.buscarUsuario(clavePublica);

    document.getElementById("nombre").value = usuario[0];
    document.getElementById("apellido").value = usuario[1];
    document.getElementById("direccion").value = usuario[2];
    document.getElementById("tipoUsuario").value = usuario[4];

    document.getElementById("content").classList.add("hidden");
    document.getElementById("perfilUsuario").classList.remove("hidden");
  } catch (error) {
    console.error("Error al intentar obtener el perfil del usuario:", error);
    alert("Hubo un problema al obtener la información del perfil.");
  }
}

function mostrarSeccion(seccion) {
  if (seccion === "inicio") {
    location.reload();
  }
}

function cerrarSesion() {
  localStorage.removeItem("clavePublica");
  localStorage.removeItem("direccionContrato");

  window.location.href = "Login.html";
}

function redirigirADonacion() {
  if (!document.getElementById("donarButton").disabled) {
    window.location.href = "donacion.html";
  } else {
    alert("Solo los donantes pueden realizar una donación de juguetes.");
  }
}
