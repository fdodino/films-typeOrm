export default {
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "",
  "database": "arifici",
  "logging": true,
  "synchronize": true,
  "entities": [ 'server/domain/*.ts' ]
}