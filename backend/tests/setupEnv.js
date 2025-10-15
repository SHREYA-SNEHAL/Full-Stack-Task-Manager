export default async function setupEnv(){   
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "Key";
    process.env.DB_NAME = "task_manager_test"; // your test DB
    process.env.DB_USER = "postgres";
    process.env.DB_PASSWORD = "postgres123";
    process.env.DB_HOST = "localhost";
    process.env.DB_PORT = 5432;
}