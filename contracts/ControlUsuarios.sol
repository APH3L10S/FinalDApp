// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ControlUsuarios is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _teamIds; //Contiene IDs de los equipos
    Counters.Counter private _playerIds; //Contiene IDs de los jugadores

    struct Team {
        uint256 id;
        string name;
        string acronym;
        string country;
        string league;
        address publicKey;
        address privateKey;
    }

    struct Player {
        uint256 id;
        string name;
        string nickname;
        string nationality;
        string role;
        address publicKey;
        address privateKey;
    }

    mapping(uint256 => Team) private teams; //Mapping donde estarán contenidos los equipos (y su información)
    mapping(uint256 => Player) private players; //Mapping donde estarán contenidos los jugadores (y su información)

    event TeamRegistered(uint256 id, string name); //Evento - Se registró un equipo
    event PlayerRegistered(uint256 id, string name); //Evento - Se registró un jugador

    function registerTeam(
        string memory name,
        string memory acronym,
        string memory country,
        string memory league,
        address publicKey,
        address privateKey
    ) public returns (uint256) {
        _teamIds.increment();
        uint256 newTeamId = _teamIds.current(); //Asignar ID al equipo
        teams[newTeamId] = Team(newTeamId, name, acronym, country, league, publicKey, privateKey);
        emit TeamRegistered(newTeamId, name); //Emitir evento - Se registró un equipo
        return newTeamId;
    }

    function registerPlayer(
        string memory name,
        string memory nickname,
        string memory nationality,
        string memory role,
        address publicKey,
        address privateKey
    ) public returns (uint256) {
        _playerIds.increment();
        uint256 newPlayerId = _playerIds.current(); //Asignar ID al jugador
        players[newPlayerId] = Player(newPlayerId, name, nickname, nationality, role, publicKey, privateKey);
        emit PlayerRegistered(newPlayerId, name); //Emitir evento - Se registró un jugador
        return newPlayerId;
    }

    //Obtener información de todos los equipos almacenados
    function getTeams() public view returns (Team[] memory) {
        Team[] memory teamsArray = new Team[](_teamIds.current());
        for(uint256 i = 0; i < _teamIds.current(); i++) {
            Team storage team = teams[i+1];
            teamsArray[i] = team;
        }
        return teamsArray;
    }
    
    //Obtener información de todos los jugadores almacenados
    function getPlayers() public view returns (Player[] memory) {
        Player[] memory playersArray = new Player[](_playerIds.current());
        for(uint256 i = 0; i < _playerIds.current(); i++) {
            Player storage player = players[i+1];
            playersArray[i] = player;
        }
        return playersArray;
    }

    //Obtener información de un equipo en base a su ID
    function getTeamById(uint256 teamId) public view returns (Team memory) {
        require(teamId > 0 && teamId <= _teamIds.current(), "El equipo no existe o no fue registrado correctamente");
        return teams[teamId]; //Imprimir información solamente del equipo con ese ID
    }

    //Obtener información de un jugador en base a su ID
    function getPlayerById(uint256 playerId) public view returns (Player memory) {
        require(playerId > 0 && playerId <= _playerIds.current(), "El jugador no existe o no fue registrado correctamente");
        return players[playerId];
    }
}
