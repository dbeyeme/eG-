import 'dotenv/config';
import mysql from 'mysql2/promise';

function fromMysqlUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, '') || 'voyageur-241',
  };
}

export function createPool() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL;
  const base = url
    ? fromMysqlUrl(url)
    : {
        host: process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
        database:
          process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'voyageur-241',
      };

  return mysql.createPool({
    ...base,
    waitForConnections: true,
    connectionLimit: 8,
    namedPlaceholders: true,
    dateStrings: true,
  });
}

export type Pool = ReturnType<typeof createPool>;
