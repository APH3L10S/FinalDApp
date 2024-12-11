const EXPECTED_CHAIN_ID = 11155111; // Cambia esto según el Chain ID de tu red
// Cargar variables de entorno desde el archivo .env
import dotenv from 'dotenv';
dotenv.config();

// Importar la ABI del contrato desde el archivo JSON generado por Hardhat
const contractABI = require('../artifacts/contracts/ControlUsuarios.sol/DonacionesDeJuguetes.json').abi;

// Obtener la dirección del contrato desde el archivo .env
const contractAddress = process.env.DONACIONESDEJUGUETES_ADDRESS;

let provider;
let signer;
let contract;

// Mostrar modal con mensaje específico
function showModal(message) {
    const modal = document.getElementById("myModal");
    const modalText = document.getElementById("modalText");
    modalText.innerText = message;
    modal.style.display = "block";
}

// Cerrar modal
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}

// Manejar el cierre del modal
document.querySelector(".close").onclick = function () {
    closeModal();
}

// Manejar clic fuera del modal para cerrarlo
window.onclick = function (event) {
    const modal = document.getElementById("myModal");
    if (event.target == modal) {
        closeModal();
    }
}

// Función para conectar a MetaMask y registrar un nuevo usuario en el contrato
async function registrarUsuario() {
    try {
        // Conectar a MetaMask
        if (typeof window.ethereum === 'undefined') {
            showModal("Por favor instala MetaMask para continuar. Puedes instalarlo desde https://metamask.io/");
            return;
        }

        // Solicitar conexión a MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            showModal("No se encontró ninguna cuenta en MetaMask. Asegúrate de tener una cuenta activa.");
            return;
        }

        // Crear proveedor y firmante a partir de MetaMask
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Verificar la red
        const network = await provider.getNetwork();
        if (network.chainId !== EXPECTED_CHAIN_ID) {
            showModal(`Por favor conecta MetaMask a la red correcta. Se esperaba la red con chainId: ${EXPECTED_CHAIN_ID}, pero estás en la red con chainId: ${network.chainId}`);
            return;
        }

        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const direccion = document.getElementById('direccion').value;
        const tipoUsuario = document.getElementById('tipoUsuario').value;
        const clavePublica = document.getElementById('clavePublica').value;
        const password = document.getElementById('password').value;

        // Validación básica de campos
        if (!nombre || !apellido || !direccion || !tipoUsuario || !clavePublica || !password) {
            showModal("Por favor, completa todos los campos antes de registrar.");
            return;
        }

        // Verificar si la clave pública es válida
        if (!ethers.utils.isAddress(clavePublica)) {
            showModal("La clave pública proporcionada no es válida. Por favor verifica e intenta de nuevo.");
            return;
        }

        // Llamar a la función para registrar usuario en el contrato
        const tx = await contract.agregarUsuario(nombre, apellido, direccion, tipoUsuario, clavePublica, password);
        showModal("Transacción enviada. Esperando confirmación...");
        await tx.wait(); // Esperar a que la transacción sea minada
        showModal("Usuario registrado con éxito");

        // Redirigir al usuario a la página de inicio de sesión después del registro exitoso
        setTimeout(() => {
            window.location.href = "Login.html";
        }, 2000);

    } catch (error) {
        console.error("Error al intentar registrar el usuario:", error);

        // Manejo de errores específicos
        if (error.code === 4001) {
            showModal("Conexión rechazada por el usuario. Por favor intenta de nuevo.");
        } else if (error.code === -32002) {
            showModal("MetaMask ya tiene una solicitud de conexión pendiente. Por favor revisa MetaMask.");
        } else if (error.code === -32603) {
            showModal("Error interno del contrato. Por favor verifica que todos los datos sean correctos y que la red sea la correcta.");
        } else {
            showModal("Hubo un problema al registrar el usuario. Verifica la consola para más detalles.");
        }
    }
}

// Función de login para autenticar al usuario
async function loginUsuario() {
    try {
        // Conectar a MetaMask
        if (typeof window.ethereum === 'undefined') {
            showModal("Por favor instala MetaMask para continuar.");
            return;
        }

        // Solicitar conexión a MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            showModal("No se encontró ninguna cuenta en MetaMask.");
            return;
        }

        // Crear proveedor y firmante a partir de MetaMask
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Obtener valores de login
        const clavePublica = document.getElementById('clavePublica').value;
        const password = document.getElementById('password').value;

        // Validación básica
        if (!clavePublica || !password) {
            showModal("Por favor ingresa la clave pública y la contraseña.");
            return;
        }

        // Llamar a la función login del contrato
        const loginExitoso = await contract.login(clavePublica, password);

        if (loginExitoso) {
            showModal("Login exitoso");
            setTimeout(() => {
                window.location.href = "Dashboard.html"; // Redirige al usuario a su panel
            }, 2000);
        } else {
            showModal("Credenciales incorrectas.");
        }
    } catch (error) {
        console.error("Error al intentar realizar el login:", error);
        showModal("Hubo un problema al realizar el login.");
    }
}