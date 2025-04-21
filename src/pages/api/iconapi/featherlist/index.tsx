import { NextApiRequest, NextApiResponse } from "next";
import iconlist from "../../../../../public/Api_Data/featherData.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            res.status(200).json(iconlist);
        } catch (err) {
            console.log("Data is not fetch!!! Please check console!!!");
        }
    }
}