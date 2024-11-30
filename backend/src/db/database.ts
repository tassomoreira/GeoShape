import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
});

async function getStateSvgPath(stateId:number) {
    try {
        const values = [stateId];
        const result = await pool.query(`
            SELECT ST_AsSVG(Geom) 
            FROM Estado 
            WHERE Codigo ILIKE $1
        `, values);

        return result.rows[0].st_assvg;
    } catch (error) {
        console.log("Error executing query from state");
        throw error;
    }
}

async function getMunicipalitySvgPath(stateId:number, municipalityId:number) {
    try {
        const values = [stateId, municipalityId];
        const result = await pool.query(`
            SELECT ST_AsSVG(M.Geom)
            FROM Estado E, Municipio M
            WHERE E.Codigo ILIKE $1 AND M.Codigo ILIKE $2  
        `, values);
        
        return result.rows[0].st_assvg;
    } catch(error) {
        console.log("Error executing query from municipality");
        throw error;
    }
}

async function getViewbox(stateId:number) {
    try {
        const values = [stateId];
        const result = await pool.query("SELECT getViewBoxById($1)", values);

        return result.rows[0].getviewboxbyid;
    } catch(error) {
        console.log("Error executing query from view box");
        throw error;
    }
}

export { getStateSvgPath, getMunicipalitySvgPath, getViewbox };