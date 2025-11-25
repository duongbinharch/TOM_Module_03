import * as React from "react"
import { ITodo, TodoListManager } from "../classes/TodoListManager"

interface Props {
  manager: TodoListManager
  existing?: ITodo | null
  onSaved?: () => void
  onCancel?: () => void
}

export default function TodoForm({ manager, existing = null, onSaved, onCancel }: Props) {
  const [title, setTitle] = React.useState(existing?.title ?? "")
  const [status, setStatus] = React.useState(existing?.status ?? "todo")
  const [priority, setPriority] = React.useState<number>(existing?.priority ?? 3)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setTitle(existing?.title ?? "")
    setStatus(existing?.status ?? "todo")
    setPriority(existing?.priority ?? 3)
  }, [existing])

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim()) return alert("Title required")
    setLoading(true)
    try {
      if (existing) {
        await manager.updateTodo(existing.id, { title, status, priority })
      } else {
        await manager.addTodo({
          projectId: manager.projectId,
          title,
          status,
          priority
        } as any)
        setTitle("")
      }
      onSaved?.()
    } catch (err) {
      console.error(err)
      alert("Save failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" style={{ flex: 1, minWidth: 200}} />
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="todo">To Do</option>
        <option value="inprogress">In Progress</option>
        <option value="done">Done</option>
        <option value="blocked">Blocked</option>
      </select>
      <select value={priority} onChange={e => setPriority(Number(e.target.value))}>
        <option value={1}>1 (Low)</option>
        <option value={3}>3</option>
        <option value={5}>5 (Medium)</option>
        <option value={8}>8</option>
        <option value={10}>10 (High)</option>
      </select>
      <button type="submit" disabled={loading} style={{ height: 36 }}>{existing ? "Update" : "Add"}</button>
      {existing && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  )
}