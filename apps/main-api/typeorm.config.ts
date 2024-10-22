import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const caCert = fs.readFileSync(path.join(__dirname, "..", "..", "ca-certificate.crt"));

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT as string),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  migrations: [__dirname + "/src/migrations/*{.ts,.js}"],
  ssl: {
    ca: caCert,
  },
});
