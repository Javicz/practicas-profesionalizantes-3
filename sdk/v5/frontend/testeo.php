<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Panel QA API</title>

<style>
body{
    font-family: Arial;
    margin:20px;
}

input{
    margin:4px;
    padding:6px;
}

button{
    margin:4px;
    padding:6px;
}

pre{
    background:#111;
    color:#0f0;
    padding:10px;
    min-height:250px;
    overflow:auto;
}
</style>

</head>

<body>

<h1>Panel QA</h1>

<h2>Login</h2>

<input id="username" placeholder="usuario">
<input id="password" type="password" placeholder="password">

<button onclick="login()">Login</button>
<button onclick="logout()">Logout</button>
<button onclick="showSession()">Ver Sesión</button>

<hr>

<h2>Usuarios</h2>

<button onclick="listUsers()">Listar Usuarios</button>

<br><br>

<input id="deleteUserId" placeholder="ID usuario">
<button onclick="deleteUser()">Eliminar Usuario</button>

<hr>

<h2>Grupos</h2>

<button onclick="listGroups()">Listar Grupos</button>

<br><br>

<input id="groupName" placeholder="Nombre grupo">
<button onclick="createGroup()">Crear Grupo</button>

<br><br>

<input id="groupDeleteId" placeholder="ID grupo">
<button onclick="deleteGroup()">Eliminar Grupo</button>

<br><br>

<input id="groupUpdateId" placeholder="ID grupo">
<input id="groupUpdateName" placeholder="Nuevo nombre">
<button onclick="updateGroup()">Modificar Grupo</button>

<hr>

<h2>Endpoints</h2>

<input id="endpointPath" placeholder="/api/test">
<button onclick="createEndpoint()">Crear Endpoint</button>

<br><br>

<input id="endpointDeleteId" placeholder="ID endpoint">
<button onclick="deleteEndpoint()">Eliminar Endpoint</button>

<hr>

<h2>Permisos</h2>

<input id="permissionGroup" placeholder="Nombre grupo">
<input id="permissionEndpoint" placeholder="/api/users">

<button onclick="addPermission()">
Dar Permiso
</button>

<hr>

<h2>Pruebas</h2>

<button onclick="callSimple('/sayHello')">
sayHello
</button>

<button onclick="callSimple('/log')">
log
</button>

<hr>

<h2>Resultado</h2>

<pre id="output"></pre>

<script>

const API = "http://127.0.0.1:3000";

function print(data)
{
    document.getElementById("output").textContent =
        typeof data === "string"
        ? data
        : JSON.stringify(data, null, 2);
}

function getUserId()
{
    return localStorage.getItem("userId");
}

function getApiKey()
{
    return localStorage.getItem("apiKey");
}

function getHeaders()
{
    return {
        "Content-Type":"application/json",
        "x-user-id":getUserId(),
        "x-api-key":getApiKey()
    };
}

class SpecificationError extends Error
{
    constructor(data)
    {
        super("Error de especificación");
        this.data = data;
    }
}

class UnauthorizedError extends Error
{
    constructor(data)
    {
        super("No autorizado");
        this.data = data;
    }
}

class DomainError extends Error
{
    constructor(data)
    {
        super("Error del dominio");
        this.data = data;
    }
}

class ProgramError extends Error
{
    constructor(data)
    {
        super("Error interno del servidor");
        this.data = data;
    }
}

async function RPCWebAPIFetch(path, body = {})
{
    const res = await fetch(
        API + path,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body)
        }
    );

    switch(res.status)
    {
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

function handleRPCError(error)
{
    if(error instanceof UnauthorizedError)
    {
        print("No autorizado");
        return;
    }

    if(error instanceof DomainError)
    {
        print(error.data);
        return;
    }

    if(error instanceof SpecificationError)
    {
        print(error.data);
        return;
    }

    if(error instanceof ProgramError)
    {
        print("Error interno");
        return;
    }

    print(error);
}

async function login()
{
  try{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = await RPCWebAPIFetch(
        "/login",
        {
        username,
        password
        }
    );

    print(data);

    if(data.status)
    {
        localStorage.setItem("userId", data.result.id);
        localStorage.setItem("apiKey", data.result.apiKey);
    }
  }
  catch(error){
    handleRPCError(error);
  }
}

function logout()
{
    localStorage.removeItem("userId");
    localStorage.removeItem("apiKey");
    print("Sesión eliminada");
}

function showSession()
{
    print({
        userId:getUserId(),
        apiKey:getApiKey()
    });
}

async function listUsers()
{
  try{
    const data = await RPCWebAPIFetch("/api/users");
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function listGroups()
{
  try{
   const data = await RPCWebAPIFetch("/api/groups");
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function deleteUser()
{
  try{
    const data = await RPCWebAPIFetch(
        "/api/admin/user/delete",
        {
            user_id: Number(document.getElementById("deleteUserId").value)
        }
    );
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function createGroup()
{
 try{
    const data = await RPCWebAPIFetch(
        "/api/admin/group/create",
        {
            name: document.getElementById("groupName").value
        }
    );
    print(data); 
  }
  catch(error){
    handleRPCError(error);
  }
}

async function deleteGroup()
{   
  try{
    const data = await RPCWebAPIFetch(
        "/api/admin/group/delete",
        {
            id:Number(document.getElementById("groupDeleteId").value)
        }
    );
    print(data);
   }
   catch(error){
     handleRPCError(error);
   }
}

async function updateGroup()
{
  try{
    const data = await RPCWebAPIFetch(
        "/api/admin/group/update",
        {
            id:Number(document.getElementById("groupUpdateId").value),
            name: document.getElementById("groupUpdateName").value
        }
    );
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function createEndpoint()
{
 try{
    const data = await RPCWebAPIFetch(
        "/api/admin/endpoint/create",
        {
            path: document.getElementById("endpointPath").value
        }
    );
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function deleteEndpoint()
{
  try{
    const data = await RPCWebAPIFetch(
        "/api/admin/endpoint/delete",
        {
            endpoint_id:Number(document.getElementById("endpointDeleteId").value)
        }
    );
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function addPermission()
{
  try{
    const data = await RPCWebAPIFetch(
        "/api/admin/permissions",
        {
            group_name: document.getElementById("permissionGroup").value,
            endpoint: document.getElementById("permissionEndpoint").value
        }
    );
    print(data);
  }
  catch(error){
    handleRPCError(error);
  }
}

async function callSimple(path)
{
    try
    {
        const data = await RPCWebAPIFetch(path);
        print(data);
    }
    catch(error)
    {
        handleRPCError(error);
    }
}

</script>

</body>
</html>