import express from "express";
import cors from "cors";

import * as db from "./db/database"

const app = express();
const port = 3000;

app.use(cors());

app.get("/shapes/:stateId/:municipalityId", async (req, res) => {
    try {
        const stateId:number = Number(req.params.stateId);
        const municipalityId:number = Number(req.params.municipalityId);

        const statePath = await db.getStateSvgPath(stateId);
        const municipalityPath = await db.getMunicipalitySvgPath(stateId, municipalityId);
        const viewBox = await db.getViewbox(stateId);

        res.status(200).json({ statePath, municipalityPath, viewBox });
    } catch(e) {
        console.error(e);
        res.status(404).json({ error: "Falha ao encontrar o estado e o município selecionado" });
    }
})

app.listen(port, () => console.log(`Server listening on port ${port}...`));