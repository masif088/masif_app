import { NextApiRequest, NextApiResponse } from "next";
import todoList from "../../../../public/Api_Data/task.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            res.status(200).json(todoList);
        } catch (err) {
            console.log("Data is not fetch!!! Please check console!!!");
        }
    }
}