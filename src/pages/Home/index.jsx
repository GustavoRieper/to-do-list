import React, { useContext, useEffect, useState } from "react";
import { AuthGoogleContext } from "../../contexts/authGoogle";
import { MagnifyingGlass, Eraser, Plus, XCircle, Check, Lock, LockOpen } from "@phosphor-icons/react";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { firestore } from "../../services/firebaseConfig";
import "./style.scss";
import "../../style/global.scss";

export const Home = () => {
    const { user, signOut, users } = useContext(AuthGoogleContext);

    const [activeTab, setActiveTab] = useState("pending");
    const [btnCreateTask, setBtnCreateTask] = useState("d-none");
    const [btnAddUserTask, setBtnAddUserTask] = useState("d-none");

    const [isViewingTask, setIsViewingTask] = useState(true);
    const [titleViewTask, setTitleViewTask] = useState("");
    const [descViewTask, setDescViewTask] = useState("");

    const [taskId, setTaskId] = useState("");
    const [taskBlock, setTaskBlock] = useState(false);
    const [taskBlockCreated, setTaskBlockCreated] = useState("");

    const [titleFilter, setTitleFilter] = useState("");
    const [tasksNoFilter, setTasksNoFilter] = useState([]);

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [listProjectsPending, setListProjectsPending] = useState([]);
    const [listProjectsFinalized, setListProjectsFinalized] = useState([]);

    useEffect(() => {
        // Adicionar listener para tarefas pendentes (Atualização em tempo real)
        const unsubscribePending = onSnapshot(
            query(collection(firestore, "tasks"), where("status", "==", "pending")),
            (snapshot) => {
                const tasks = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date_time,
                }));
                setListProjectsPending(tasks);
            }
        );

        // Adicionar listener para tarefas finalizadas (Atualização em tempo real)
        const unsubscribeFinalized = onSnapshot(
            query(collection(firestore, "tasks"), where("status", "==", "finalized")),
            (snapshot) => {
                const tasks = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date_time,
                }));
                setListProjectsFinalized(tasks);
            }
        );

        // Limpar os listeners ao desmontar o componente
        return () => {
            unsubscribePending();
            unsubscribeFinalized();
        };
    }, []);

    function openCard(title, description, id, participants, emailCreated, block) {
        setTaskBlock(false);
        setBtnCreateTask("d-flex");
        setBtnAddUserTask("d-none");
        setIsViewingTask(true);
        setTaskBlockCreated(emailCreated);
        setTaskBlock(block)

        if (id) {
            setTaskId(id);
        }

        if (title) {
            setTitleViewTask(title);
        } else {
            setTitleViewTask("");
        }

        if (description) {
            setDescViewTask(description);
        } else {
            setDescViewTask("");
        }

        if(participants){
            setSelectedUsers(participants);
        }else{
            setSelectedUsers([]);
        }
    }

    function createCard() {
        setBtnCreateTask("d-flex");
        setBtnAddUserTask("d-none");
        setIsViewingTask(false);
        setTitleViewTask("");
        setDescViewTask("");
        setTaskId("");
        setTaskBlockCreated("");
    }

    function filter() {
        if(titleFilter){
            if(activeTab === 'pending'){
                setTasksNoFilter(listProjectsPending);
                const filteredTasks = listProjectsPending.filter((task) => 
                    task.title.toLowerCase().includes(titleFilter.toLowerCase())
                );
                setListProjectsPending(filteredTasks);

            }else{
                setTasksNoFilter(listProjectsFinalized);
                const filteredTasks = listProjectsFinalized.filter((task) => 
                    task.title.toLowerCase().includes(titleFilter.toLowerCase())
                );
                setListProjectsFinalized(filteredTasks);
            }

        }else{
            alert('Nenhum filtro foi informado!');
        }
    }

    function activeBlock(){
        setTaskBlock(true);
    }

    function desactiveBlock(){
        setTaskBlock(false);
    }

    const clear_filter = async () => {
        if(tasksNoFilter && tasksNoFilter != ""){
            if(activeTab === 'pending'){
                await setListProjectsPending(tasksNoFilter);
                await setTitleFilter("");
                await setTasksNoFilter("");
            }else{
                await setListProjectsFinalized(tasksNoFilter);
                await setTitleFilter("");
                await setTasksNoFilter(""); 
            }
        }
    }

    const handleAddUser = (user) => {
        const userExists = selectedUsers.some((selectedUser) => selectedUser.email === user.email);

        if (!userExists) {
        setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleCreateTask = async () => {
        const title = titleViewTask;
        const description = descViewTask;
        const created_by = user.email;
        const date = new Date().toLocaleString();

        const participants = selectedUsers.map((user) => ({
        email: user.email,
        name: user.name,
        photo: user.photo,
        }));

        const newTask = {
        title,
        description,
        created_by,
        date_time: date,
        status: "pending",
        block: taskBlock,
        participants,
        };

        try {
        if (taskId) {
            await updateDoc(doc(firestore, "tasks", taskId), newTask);
            console.log("Tarefa atualizada com sucesso.");
        } else {
            await addDoc(collection(firestore, "tasks"), newTask);
            console.log("Tarefa criada com sucesso.");
        }

        setBtnCreateTask("d-none");
        setBtnAddUserTask("d-none");
        setSelectedUsers([]);
        } catch (error) {
        console.error("Erro ao criar ou atualizar a task:", error);
        }
    };

    const handleTaskCompletion = async (id) => {
        try {
        await updateDoc(doc(firestore, "tasks", id), {
            status: "finalized",
        });
        console.log("Tarefa concluída com sucesso.");
        } catch (error) {
        console.error("Erro ao concluir a task:", error);
        }
    };

    const handleRemoveTask = async (id) => {
        try {
          await deleteDoc(doc(firestore, "tasks", id));
          console.log("Tarefa removida com sucesso.");
          // Atualizar a lista de tarefas pendentes após a remoção
          setListProjectsPending((prevTasks) => prevTasks.filter((task) => task.id !== id));
          setBtnCreateTask("d-none");
          setSelectedUsers([]);
        } catch (error) {
          console.error("Erro ao remover a task:", error);
        }
    };

    return (
        <div className="app">
            <div className="header">
                <div>
                <img src={user.photoURL} alt="Foto do usuário" />
                <h1>{user.displayName}</h1>
                </div>
                <button onClick={signOut}>Sair</button>
            </div>

            <div className="filter">
                <input type="text" placeholder="Filtrar Task" onChange={(e) => setTitleFilter(e.target.value)} value={titleFilter} />
                <div className="actions">
                    <Eraser id="removeSearch" onClick={clear_filter}/>
                    <MagnifyingGlass id="search"
                    onClick={filter}
                />
                </div>
            </div>

            <div className="container-app">
                <button className="add-task" onClick={createCard}>
                <Plus />
                </button>

                <div className="box-participants">
                <div className="participants">
                    <h2>Participantes</h2>
                </div>

                <div className="list-participants">
                    {users.map((user_list) => (
                    <div className="users-participants" key={user_list.email}>
                        <div className="area-image">
                        <img src={user_list.photo} alt={user_list.name} />
                        </div>
                        <span>
                        {user_list.name} {user.email === user_list.email ? `(Você)` : ``}
                        </span>
                    </div>
                    ))}
                </div>
                </div>

                <div className="container-list">
                <div className="header">
                    <h2 className={`pending ${activeTab === "pending" ? "active" : ""}`} onClick={() => {clear_filter(); setActiveTab("pending")}}>
                    Pendentes
                    </h2>
                    <h2 className={`finalized ${activeTab === "finalized" ? "active" : ""}`} onClick={() => {clear_filter(); setActiveTab("finalized")}}>
                    Finalizados
                    </h2>
                </div>

                <div className="content-list">
                    {activeTab === "pending" ? (
                    listProjectsPending.map((project) => (
                        <div
                        className="card"
                        key={project.id}
                        onClick={() => openCard(project.title, project.description, project.id, project.participants, project.created_by, project.block)}
                        >
                            {!project.block ? (
                                <button className="complete-task" onClick={(e) => e.stopPropagation()}>
                                    <Check  onClick={() => handleTaskCompletion(project.id)} />
                                </button>
                            ) : (
                                <div className="block"><Lock /></div>
                            )}
                            
                            <div className="title">
                                <h3>{project.title}</h3>
                            </div>
                            <div className="participants">
                                {project.participants.map((user) => (
                                <img key={user.email} src={user.photo} alt={user.name} title={user.name} />
                                ))}
                            </div>
                        </div>
                    ))
                    ) : (
                    listProjectsFinalized.map((project) => (
                        <div
                        className="card finalized"
                        key={project.id}
                        onClick={() => openCard(project.title, project.description, project.id, project.participants, project.created_by, project.block)}
                        >
                        <div className="title">
                            <h3>{project.title}</h3>
                        </div>
                        <div className="participants">
                            {project.participants.map((user) => (
                            <img key={user.email} src={user.photo} alt={user.name} title={user.name} />
                            ))}
                        </div>
                        </div>
                    ))
                    )}

                    <div className={`view-task ${btnCreateTask === "d-none" ? "d-none" : "d-flex"}`}>
                    <div className="header">
                        <input
                        type="text"
                        className="titleTask"
                        placeholder="Informe um título"
                        disabled={taskBlock && taskBlockCreated !== user.email ? isViewingTask : undefined}
                        onChange={(e) => setTitleViewTask(e.target.value)}
                        value={titleViewTask}
                        />
                    </div>
                    <div className="content">
                        {taskBlockCreated ? (<sub>Criado por: {taskBlockCreated} {user.email == taskBlockCreated ? " (Você)" : "" }</sub>) : ""}
                        <textarea
                        className="descriptionTask"
                        placeholder="Informe uma Descrição"
                        disabled={taskBlock && taskBlockCreated !== user.email ? isViewingTask : undefined}
                        onChange={(e) => setDescViewTask(e.target.value)}
                        value={descViewTask}
                        ></textarea>
                    </div>
                    <div className="footer">
                        <div className={`container-add ${btnAddUserTask === "d-none" ? "d-none" : "d-flex"}`}>
                        <h3>Adicionar Participantes</h3>
                        <div className="list-users">
                            {users.map((user_list) => (
                            <img
                                key={user_list.email}
                                src={user_list.photo}
                                alt={user_list.name}
                                id={user_list.email}
                                onClick={() => handleAddUser(user_list)}
                            />
                            ))}
                        </div>
                        </div>
                        <div className="participants">
                        {selectedUsers.map((user) => (
                            <div key={user.email}>
                            <XCircle title="Remover Usuário" onClick={() => setSelectedUsers(selectedUsers.filter((u) => u.email !== user.email))} />
                            <img src={user.photo} alt={user.name} />
                            </div>
                        ))}
                        {
                            !taskBlock || taskBlockCreated === user.email ? (
                                <button className="add-user" title="Adicionar Usuário" onClick={() => setBtnAddUserTask((prev) => (prev === "d-none" ? "d-flex" : "d-none"))}>
                                    <Plus />
                                </button>
                            ) : ("")
                        }
                        </div>
                        <div className="actions">
                        <button className="cancel" onClick={() => {setBtnCreateTask("d-none"); setSelectedUsers([]);}}>
                            Cancelar
                        </button>
                        {
                            !isViewingTask ? (
                                <>
                                    <button className="block" onClick={activeBlock}>
                                        Bloquear
                                    </button>
                                    <button className="create" onClick={handleCreateTask}>
                                        Criar
                                    </button>
                                </>
                            ) : !taskBlock || taskBlockCreated === user.email ? (
                                <>
                                <button className="remove" onClick={() => handleRemoveTask(taskId)}>
                                    Remover
                                </button>
                                {
                                    taskBlockCreated === user.email ? (
                                        taskBlock ? (
                                            <button className="block" onClick={desactiveBlock}>
                                                <LockOpen />
                                                Desbloquear
                                            </button>
                                        ) : (
                                            <button className="block" onClick={activeBlock}>
                                                <Lock />
                                                Bloquear
                                            </button>
                                        )
                                        
                                    ) : (
                                        ""
                                    )
                                }
                                <button className="create" onClick={handleCreateTask}>
                                    Salvar
                                </button>
                                </>
                            ) : (
                                ""
                            )
                        }
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};
