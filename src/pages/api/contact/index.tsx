import { NextApiRequest, NextApiResponse } from "next";
import contactList from "../../../../public/Api_Data/contacts.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            res.status(200).json(contactList);
        } catch (err) {
            console.log("Data is not fetch!!! Please check console!!!");
        }
    }
}