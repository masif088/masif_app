// import { taskListInterFace } from "@/pages/app/task";
import { Dispatch, SetStateAction, createContext } from "react";
interface GlobalType  {
    allTask: any[];
    setAllTask: Dispatch<SetStateAction< any[]>>;
    addNewTask:(data:any)=>void
    removeTask:(data:number)=>void
};

const TaskContext = createContext<GlobalType>({
  allTask: [],
  setAllTask: () => {},
  addNewTask:()=>{},
  removeTask:()=>{}
});

export default TaskContext;
