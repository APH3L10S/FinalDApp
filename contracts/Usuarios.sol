// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Usuarios {

    enum TipoUsuario { Equipo, Jugador }

    struct Usuario {
        TipoUsuario tipo;
        string nombre;
        address wallet;
    }

    mapping(address => Usuario) public usuarios;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta funcion");
        _;
    }

    constructor() {
        owner = msg.sender; // El propietario del contrato será quien lo despliegue
    }

    // Función para registrar un usuario
    function registrarUsuario(address _wallet, TipoUsuario _tipo, string memory _nombre) public onlyOwner {
        usuarios[_wallet] = Usuario(_tipo, _nombre, _wallet);
    }

    // Función para consultar los datos de un usuario
    function consultarUsuario(address _wallet) public view returns (TipoUsuario, string memory) {
        require(usuarios[_wallet].wallet != address(0), "Usuario no registrado");
        return (usuarios[_wallet].tipo, usuarios[_wallet].nombre);
    }

    // Función para eliminar un usuario
    function eliminarUsuario(address _wallet) public onlyOwner {
        require(usuarios[_wallet].wallet != address(0), "Usuario no registrado");
        delete usuarios[_wallet];
    }
}
