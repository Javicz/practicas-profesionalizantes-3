<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Panel QA API</title>
<style>
body {
    font-family: Arial, sans-serif;
    margin: 20px;
    background: #f5f5f5;
}
.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
h1, h2 {
    color: #333;
}
input, button {
    margin: 4px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
}
button {
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
}
button:hover {
    background: #0056b3;
}
button.danger {
    background: #dc3545;
}
button.danger:hover {
    background: #c82333;
}
button.success {
    background: #28a745;
}
button.success:hover {
    background: #1e7e34;
}
pre {
    background: #1e1e1e;
    color: #0f0;
    padding: 15px;
    min-height: 250px;
    overflow: auto;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
}
hr {
    margin: 20px 0;
    border: 0;
    border-top: 1px solid #ddd;
}
.row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.row input {
    flex: 1;
    min-width: 120px;
}
</style>
</head>
<body>

<div class="container">

<h1>Panel QA</h1>

<h2>Login</h2>
<div class="row">
    <input id="username" placeholder="usuario">
    <input id="password" type="password" placeholder="password">
    <button id="btnLogin">Login</button>
    <button id="btnLogout">Logout</button>
    <button id="btnSession">Ver Sesión</button>
</div>

<hr>

<h2>Usuarios</h2>
<div class="row">
    <button id="btnListUsers">Listar Usuarios</button>
</div>
<div class="row">
    <input id="deleteUserId" placeholder="ID usuario">
    <button id="btnDeleteUser" class="danger">Eliminar Usuario</button>
</div>

<hr>

<h2>Grupos</h2>
<div class="row">
    <button id="btnListGroups">Listar Grupos</button>
</div>
<div class="row">
    <input id="groupName" placeholder="Nombre grupo">
    <button id="btnCreateGroup" class="success">Crear Grupo</button>
</div>
<div class="row">
    <input id="groupDeleteId" placeholder="ID grupo">
    <button id="btnDeleteGroup" class="danger">Eliminar Grupo</button>
</div>
<div class="row">
    <input id="groupUpdateId" placeholder="ID grupo">
    <input id="groupUpdateName" placeholder="Nuevo nombre">
    <button id="btnUpdateGroup">Modificar Grupo</button>
</div>

<hr>

<h2>Endpoints</h2>
<div class="row">
    <input id="endpointPath" placeholder="/api/test">
    <button id="btnCreateEndpoint" class="success">Crear Endpoint</button>
</div>
<div class="row">
    <input id="endpointDeleteId" placeholder="ID endpoint">
    <button id="btnDeleteEndpoint" class="danger">Eliminar Endpoint</button>
</div>

<hr>

<h2>Permisos</h2>
<div class="row">
    <input id="permissionGroup" placeholder="Nombre grupo">
    <input id="permissionEndpoint" placeholder="/api/users">
    <button id="btnAddPermission">Dar Permiso</button>
</div>

<hr>

<h2>Pruebas</h2>
<div class="row">
    <button id="btnSayHello">sayHello</button>
    <button id="btnLog">log</button>
</div>

<hr>

<h2>Resultado</h2>
<pre id="output"></pre>

</div>

<script>
// ============================================================
// CONSTANTES Y UTILIDADES
// ============================================================
var API = "http://127.0.0.1:3000";

function print(data) {
    var output = document.getElementById("output");
    if (typeof data === "string") {
        output.textContent = data;
    } else {
        output.textContent = JSON.stringify(data, null, 2);
    }
}

function getUserId() {
    return localStorage.getItem("userId");
}

function getApiKey() {
    return localStorage.getItem("apiKey");
}

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
        "x-api-key": getApiKey()
    };
}

// ============================================================
// CLASES DE ERROR
// ============================================================
class SpecificationError extends Error {
    constructor(data) {
        super("Error de especificación");
        this.data = data;
        this.name = "SpecificationError";
    }
}

class UnauthorizedError extends Error {
    constructor(data) {
        super("No autorizado");
        this.data = data;
        this.name = "UnauthorizedError";
    }
}

class DomainError extends Error {
    constructor(data) {
        super("Error del dominio");
        this.data = data;
        this.name = "DomainError";
    }
}

class ProgramError extends Error {
    constructor(data) {
        super("Error interno del servidor");
        this.data = data;
        this.name = "ProgramError";
    }
}

// ============================================================
// FUNCIÓN RPC
// ============================================================
async function RPCWebAPIFetch(path, body) {
    if (body === undefined) body = {};

    var res = await fetch(API + path, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body)
    });

    switch (res.status) {
        case 200:
            return await res.json();
        case 400:
            throw new SpecificationError(await res.json());
        case 401:
            throw new UnauthorizedError(await res.json());
        case 422:
            throw new DomainError(await res.json());
        case 500:
            throw new ProgramError(await res.json());
        default:
            throw new Error("Respuesta inesperada del servidor.");
    }
}

function handleRPCError(error) {
    if (error instanceof UnauthorizedError) {
        print("No autorizado");
        return;
    }
    if (error instanceof DomainError) {
        print(error.data);
        return;
    }
    if (error instanceof SpecificationError) {
        print(error.data);
        return;
    }
    if (error instanceof ProgramError) {
        print("Error interno del servidor");
        return;
    }
    print(error.message || error);
}

// ============================================================
// WRAPPER PARA LLAMADAS RPC CON MANEJO DE ERRORES
// ============================================================
function callRPC(path, body, callback) {
    RPCWebAPIFetch(path, body)
        .then(function(data) {
            print(data);
            if (callback) callback(data);
        })
        .catch(function(error) {
            handleRPCError(error);
        });
}

// ============================================================
// FUNCIONES DE NEGOCIO
// ============================================================
function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (!username || !password) {
        print("Por favor, ingresa usuario y contraseña");
        return;
    }

    RPCWebAPIFetch("/login", { username: username, password: password })
        .then(function(data) {
            print(data);
            if (data.status && data.result) {
                localStorage.setItem("userId", data.result.id);
                localStorage.setItem("apiKey", data.result.apiKey);
                print("Login exitoso. ID: " + data.result.id);
            }
        })
        .catch(function(error) {
            handleRPCError(error);
        });
}

function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("apiKey");
    print("Sesión eliminada");
}

function showSession() {
    print({
        userId: getUserId(),
        apiKey: getApiKey()
    });
}

function listUsers() {
    callRPC("/api/users");
}

function listGroups() {
    callRPC("/api/groups");
}

function deleteUser() {
    var id = document.getElementById("deleteUserId").value;
    if (!id) {
        print("Por favor, ingresa un ID de usuario");
        return;
    }
    callRPC("/api/admin/user/delete", { user_id: Number(id) });
}

function createGroup() {
    var name = document.getElementById("groupName").value;
    if (!name) {
        print("Por favor, ingresa un nombre para el grupo");
        return;
    }
    callRPC("/api/admin/group/create", { name: name });
}

function deleteGroup() {
    var id = document.getElementById("groupDeleteId").value;
    if (!id) {
        print("Por favor, ingresa un ID de grupo");
        return;
    }
    callRPC("/api/admin/group/delete", { id: Number(id) });
}

function updateGroup() {
    var id = document.getElementById("groupUpdateId").value;
    var name = document.getElementById("groupUpdateName").value;
    if (!id || !name) {
        print("Por favor, ingresa ID y nuevo nombre");
        return;
    }
    callRPC("/api/admin/group/update", {
        id: Number(id),
        name: name
    });
}

function createEndpoint() {
    var path = document.getElementById("endpointPath").value;
    if (!path) {
        print("Por favor, ingresa una ruta para el endpoint");
        return;
    }
    callRPC("/api/admin/endpoint/create", { path: path });
}

function deleteEndpoint() {
    var id = document.getElementById("endpointDeleteId").value;
    if (!id) {
        print("Por favor, ingresa un ID de endpoint");
        return;
    }
    callRPC("/api/admin/endpoint/delete", { endpoint_id: Number(id) });
}

function addPermission() {
    var group = document.getElementById("permissionGroup").value;
    var endpoint = document.getElementById("permissionEndpoint").value;
    if (!group || !endpoint) {
        print("Por favor, ingresa grupo y endpoint");
        return;
    }
    callRPC("/api/admin/permissions", {
        group_name: group,
        endpoint: endpoint
    });
}

function callSimple(path) {
    callRPC(path);
}

// ============================================================
// ASIGNACIÓN DE EVENTOS 
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    // Login
    document.getElementById("btnLogin").addEventListener("click", login);
    document.getElementById("btnLogout").addEventListener("click", logout);
    document.getElementById("btnSession").addEventListener("click", showSession);

    // Usuarios
    document.getElementById("btnListUsers").addEventListener("click", listUsers);
    document.getElementById("btnDeleteUser").addEventListener("click", deleteUser);

    // Grupos
    document.getElementById("btnListGroups").addEventListener("click", listGroups);
    document.getElementById("btnCreateGroup").addEventListener("click", createGroup);
    document.getElementById("btnDeleteGroup").addEventListener("click", deleteGroup);
    document.getElementById("btnUpdateGroup").addEventListener("click", updateGroup);

    // Endpoints
    document.getElementById("btnCreateEndpoint").addEventListener("click", createEndpoint);
    document.getElementById("btnDeleteEndpoint").addEventListener("click", deleteEndpoint);

    // Permisos
    document.getElementById("btnAddPermission").addEventListener("click", addPermission);

    // Pruebas
    document.getElementById("btnSayHello").addEventListener("click", function() {
        callSimple("/sayHello");
    });
    document.getElementById("btnLog").addEventListener("click", function() {
        callSimple("/log");
    });

    // Enter en campos de texto para login
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    usernameInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            document.getElementById("btnLogin").click();
        }
    });
    passwordInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            document.getElementById("btnLogin").click();
        }
    });
});
</script>

</body>
</html>