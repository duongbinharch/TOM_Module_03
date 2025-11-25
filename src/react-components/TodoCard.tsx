import * as React from "react"
import { ITodo } from "../classes/TodoListManager"

interface Props {
  todo: ITodo
  onEdit?: () => void
  onToggle?: () => void
  onDelete?: () => void
}

const priorityColor = (p: number) => {
  if (p >= 8) return "#d32f2f" // high
  if (p >= 4) return "#f57c00" // medium
  return "#388e3c" // low
}
const statusColor = (s: string) => {
  switch ((s || "").toLowerCase()) {
    case "done": return "#17df59ff"
    case "inprogress": return "#f1ee1cff"
    case "blocked": return "#c2185b"
    default: return "#616161"
  }
}

export default function TodoCard({ todo, onEdit, onToggle, onDelete }: Props) {
  return (
    <div className="todo-item" style={{ border: "1px solid #e0e0e0", padding: 12, borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", columnGap: 12, alignItems: "center" }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            backgroundColor: priorityColor(todo.priority ?? 0),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600
          }}>
            P{todo.priority ?? 0}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{todo.title}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{/* optional: no createdAt */}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          
          <div style={{
            padding: "6px 10px",
            borderRadius: 16,
            backgroundColor: statusColor(todo.status),
            color: "#fff",
            fontSize: 12
          }}>
            {todo.status}
          </div>

          <button onClick={onToggle} style={{ padding: "6px 8px" }}>
            {(todo.status || "").toLowerCase() === "done" ? "UnDone" : "Done"}
          </button>

          <button onClick={onEdit} style={{ padding: "6px 8px" }}>Edit</button>

          <button onClick={onDelete} style={{ padding: "6px 8px", color: "#700262ff" }}>Delete</button>
        </div>
      </div>
    </div>
  )
}