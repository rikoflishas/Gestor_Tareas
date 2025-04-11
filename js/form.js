//const express = require('express');
//const cors = require('cors');
//const app = express();

// Enable CORS for all routes
//app.use(cors());

//guardamos las tareas en un array
let tasks = [];
//const API_URL = 'http://localhost:3000/tareas/';

async function addTask()
{
    const taskInput = document.getElementById('taskId');
    const taskText = taskInput.value.trim();// trim quita espacios al principio y al fin
    // pero no los de en medio 

    //No añadiremos tareas vacias
    if(!taskText)   return;

   try {
        console.log("Adding new task: ", taskText);

        //crearemos objetos de nuevas tareas con id unicos
        const newTask = {
            id: Date.now().toString(),  // este sera el id
            text: taskText,
            completed: false
        };

        console.log("New task created with ID:", newTask.id);

        // Send POST request to the API
        const response = await axios.post('http://localhost:3000/tareas/', newTask);

        const savedTask = response.data;

        //añadir task al array
        tasks.push(savedTask);

        //limpiar el campo de entrada
        taskInput.value = '';
        console.log("Tasks array after adding: ", JSON.stringify(tasks));

        //actualizar la lista de tareas
        renderTasks();
   } catch (error) {
        console.error("Error al añadir la tarea: ", error);
        alert("La tarea no pudo ser agregada. Intenta de nuevo.");
   }
}

async function getTask() {
    const taskID = document.getElementById('taskId');

    if(!taskID) return;

    try {
        //mensaje para ubicar al usuario en donde se encuentra en el proceso
        console.log("Colectando las tareas...");

        //hacemos el request del API usando AXIOS
        const response = await axios.get(`http://localhost:3000/tareas`);

        //manejando la respuesta
        console.log("Data de tareas recibidas: ", response.data);

        //añadir las tareas encontradas a la lista
        const fetchedTask = {
            id: response.data.id || Date.now().toString(),
            text: response.data.title || response.data.text,
            completed: response.data.completed || false
        };

        tasks.push(fetchedTask);

        //limpiar el campo de entrada
        document.getElementById('taskId').value = '';

        //actualizar la lista
        renderTasks();

    } catch (error) {
        //manejando los errores
        console.error("Error al colectar la tarea: ", error);
        alert("No pudimos recolectar la tarea. Intenta de nuevo.");
    }
}

async function deleteTask(taskId)
{
    console.log("Deleting task with ID:", taskId);
    console.log("Tasks before:", tasks)

    try {
        //Borrar de la API
        await axios.delete(`http://localhost:3000/tareas/${taskId}`);
        
        //filtrar las tareas con un id. Removiendolas del array local
        tasks = tasks.filter(task => task.id !== taskId);
        
        //actualizar lista de tareas 
        renderTasks();
    } catch (error) {

        console.error("Ocurrió un error al intentar elmiinar una tarea: ", error);
        alert("No se pudo eliminar la tarea. Intenta de nuevo.");
    }
}

async function editTask(taskId)
{
    const taskToEdit = tasks.find(task => task.id === taskId);
    if(!taskToEdit) return;

    const newText = prompt('Edit task: ', taskToEdit.text);

    //actualiza la tarea si el user no cancelo pero escribio texto
    if (newText !== null && newText.trim() !== '') {
        try {
            //actualizar API
            const response = await axios.put(`http://localhost:3000/tareas/${taskId}`, {
                ...taskToEdit,
                text: newText.trim()
            });

            //hay que actualizar en array local de igual manera
            taskToEdit.text = newText.trim();

            //Actualiza UI
            renderTasks();
        } catch (error) {
            console.error("error al actualizar tarea:", error);
            alert("No se pudo actualizar tarea. Intenta de nuevo.");
        }
        
        // taskToEdit.text = newText.trim();
    }
}

//mark task as done/undone
function markTask()
{
    const taskToMark = tasks.find(t => t.id === taskId);
    if(taskToMark){
        taskToMark.completed = !taskToMark.completed;
        renderTasks();
    }
}

//
// Function to load all tasks from the API
async function loadTasks() {
    try {
        const response = await axios.get('http://localhost:3000/tareas');
        tasks = response.data;
        renderTasks();
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}



function renderTasks()
{
    const taskList = document.getElementById('taskList');

    //limpiar la lista de tareas
    taskList.innerHTML = '';

    //añadir cada tarea a la lista
    tasks.forEach(task => {
        //crea el contenedor de la tarea
        const taskItem = document.createElement('div');

        //crear el elemento de html para el texto de la tarea
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        if(task.completed)
        {
            taskText.style.textDecoration = 'line-through';//tachar el texto
            taskText.style.color = '#888';//cambiar a color gris
        }

        //crear el checkbox para marcar la tarea como terminada
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener( 'change', () => markTask(task.id) );

        // Crea contener para el texto de la tarea y el checkbox
        const taskTextContainer = document.createElement('div');
        
        /**The appendChild() method of the Node interface 
         * adds a node to the end of the list of children of a specified parent node.*/
        taskTextContainer.appendChild(checkbox);
        taskTextContainer.appendChild(taskText);

        //crear los contenedores para los botones
        const buttonsContainer = document.createElement('div');

        //vamos a crear el boton para editar
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener( 'click', () => editTask(task.id) );

        //crearemos el boton para eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener(  'click', () => deleteTask(task.id)  );

        //añadir botones al contenedor 
        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(deleteButton);

        //añadir botones al contenedor 
        taskItem.appendChild(taskTextContainer);
        taskItem.appendChild(buttonsContainer);

        //añadir el item de la tarea a la lista de tareas
        taskList.appendChild(taskItem);
    });
}

// event listener que agrega la tarea cuando le picas Enter
document.getElementById('taskId').addEventListener('keypress', function(event){
    if(event.key === 'Enter')   addTask();
});

//inicializa la lista de tareas
renderTasks();

// Call this when the page loads
document.addEventListener('DOMContentLoaded', loadTasks);
