import { NextApiRequest, NextApiResponse } from "next";
import allProject from "../../../../public/Api_Data/allProject.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            res.status(200).json(allProject);
        } catch (err) {
            console.log("Data is not fetch!!! Please check console!!!");
        }
    }
}