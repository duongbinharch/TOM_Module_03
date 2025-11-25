import { firestoreDB } from '../firebase' // ensure index.ts exports firestoreDB
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'

// Class TodoListManager (service) to manage todo items for a specific project, và UI component TodoList để hiển thị danh sách todo và tương tác với TodoListManager

// Define the ITodo interface representing a todo item
export interface ITodo {
  id: string
  projectId: string
  title: string
  //done: boolean
  //createdAt: number
  status: string
  priority: number
}
//ChangeHandler type definition for change listeners help to notify when the todo list changes
type ChangeHandler = (list: ITodo[]) => void

//TodoListManager class definition
export class TodoListManager {
  projectId: string
  list: ITodo[] = []
  private handlers: ChangeHandler[] = []

  constructor(projectId: string) {
    this.projectId = projectId
  }

  //API Chính để quản lý todo items
  /*
  addChangeListener(h) / removeChangeListener(h): đăng/huỷ listener để UI nhận cập nhật.
  emit(): gọi tất cả handlers với bản sao list (this.handlers.forEach(h => h([...this.list]))). 
  todosCollectionRef(): trả về Reference tới subcollection projects/{projectId}/todos.
  loadFromFirestore(): load tất cả docs từ subcollection, cập nhật this.list và gọi emit().
  addTodo(data): addDoc vào Firestore subcollection, push kết quả (với doc.id) vào this.list, gọi emit().
  updateTodo(id, patch): updateDoc với path projects/{projectId}/todos/{id}, cập nhật this.list nội bộ, emit().
  deleteTodo(id): deleteDoc trên Firestore, xoá khỏi this.list, emit().
  */
  addChangeListener(h: ChangeHandler) { this.handlers.push(h) }
  removeChangeListener(h: ChangeHandler) {
    this.handlers = this.handlers.filter(x => x !== h)
  }
  private emit() { this.handlers.forEach(h => h([...this.list])) }

  // top-level collection: 'todoLists', filter by projectId
  private collectionRef() {
    return collection(firestoreDB, "todoLists")
  }
  private todosQuery() {
    return query(this.collectionRef(), where("projectId", "==", this.projectId))
  }

  // load dữ liệu từ Firestore vào this.list
  async loadFromFirestore() {
    const snap = await getDocs(this.todosQuery())
    this.list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as ITodo))
    this.emit()
  }

  // create a todo in top-level collection; data must include projectId
  async addTodo(data: Omit<ITodo, "id">) {
    const payload = { ...data } // must include projectId, status, priority
    const docRef = await addDoc(this.collectionRef(), payload)
    this.list.push({ id: docRef.id, ...payload } as ITodo)
    this.emit()
  }

  async updateTodo(id: string, patch: Partial<ITodo>) {
    const d = doc(firestoreDB, `todoLists/${id}`)
    await updateDoc(d, patch as any)
    const idx = this.list.findIndex(t => t.id === id)
    if (idx >= 0) { this.list[idx] = { ...this.list[idx], ...patch }; this.emit() }
  }

  async deleteTodo(id: string) {
    const d = doc(firestoreDB, `todoLists/${id}`)
    await deleteDoc(d)
    this.list = this.list.filter(t => t.id !== id)
    this.emit()
  }
}