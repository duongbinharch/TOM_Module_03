import * as React from "react"
import { ITodo, TodoListManager } from "../classes/TodoListManager"
import { SearchBox } from "./SearchBox"
import TodoCard from "./TodoCard"
import TodoForm from "./TodoForm"

interface Props {
  manager: TodoListManager
  projectId?: string
}

export default function ProjectTasksList({ manager }: Props) {
  const [todos, setTodos] = React.useState<ITodo[]>([])//? Initialize state to hold the list of todos
  const [query, setQuery] = React.useState("")//? Initialize state to hold the search query
  const [editing, setEditing] = React.useState<ITodo | null>(null)//? Initialize state to hold the todo being edited

  React.useEffect(() => {
    const handle = (list: ITodo[]) => setTodos(list)
    manager.addChangeListener(handle)
    manager.loadFromFirestore().catch(console.error)
    return () => manager.removeChangeListener(handle)
  }, [manager])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return todos
    return todos.filter(t => (t.title || "").toLowerCase().includes(q))
  }, [todos, query])

  return (
    <div style={{ margin: '10px'}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Tasks</h3>
        <div style={{ width: "80%" }}>
          <SearchBox onChange={setQuery}/>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <TodoForm
          manager={manager}
          onSaved={() => {
            setEditing(null)
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(t => (
          <TodoCard
            key={t.id}
            todo={t}
            onEdit={() => setEditing(t)}
            onToggle={() => {
              const newStatus = (t.status || "").toLowerCase() === "done" ? "todo" : "done"
              manager.updateTodo(t.id, { status: newStatus }).catch(console.error)
            }}
            onDelete={() => manager.deleteTodo(t.id).catch(console.error)}
          />
        ))}
      </div>

      {editing && (
        <div style={{ marginTop: 16 }}>
          <h4>Edit task</h4>
          <TodoForm
            manager={manager}
            existing={editing}
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  )
}

/*
//Archive old code below:
<div
        style={{
          padding: "20px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
        >
        <h4>To-Do</h4>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            columnGap: 20
          }}
          >
          <div
            style={{ display: "flex", alignItems: "center", columnGap: 10 }}
            >
            <span className="material-icons-round">search</span>
            <input
              type="text"
              placeholder="Search To-Do's by name"
              style={{ width: "100%" }}
            />
          </div>
          <span className="material-icons-round">add</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px 30px",
          rowGap: 20
        }}
      >
        <div className="todo-item">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            >
            <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
            <span
            className="material-icons-round"
            style={{
              padding: 10,
              backgroundColor: "#686868",
              borderRadius: 10
            }}
            >
            construction
            </span>
            <p>Make anything here as you want, even something longer.</p>
            </div>
            <p style={{ textWrap: "nowrap", marginLeft: 10 }}>Fri, 20 sep</p>
          </div>
        </div>

      </div>
*/