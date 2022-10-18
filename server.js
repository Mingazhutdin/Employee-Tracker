import inquirer from "inquirer";
import mysql from "mysql2";
import table from "console.table";

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "Mingazhutdi!rich",
    database: "challenge_db",
  },
  console.log("Database connected!")
);

const departmentName = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "department",
      },
    ])
    .then((answers) => {
      console.log(`Added ${answers.department} to the database`);
      db.query(`insert into department (name)
      values("${answers.department}")`);
      promptQuestions();
    });
};

const newUpdatedRole = () => {
  db.query(`select * from employee `, (error, result) => {
    const resultData = result.map((el) => el.first_name + " " + el.last_name);
    db.query(`Select title from role`, (error, result) => {
      const assignData = result.map((el) => el.title);
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee's role do you want to update?",
            name: "updatedRole",
            choices: resultData,
          },
          {
            type: "list",
            message: "Which role do you want to assign the selected employee?",
            name: "selectedEmployee",
            choices: assignData,
          },
        ])
        .then((answers) => {
          const { updatedRole, selectedEmployee } = answers;
          db.query(`select id, title from role`, (err, result) => {
            const selectedRoleId = result.filter(
              (el) => el.title == selectedEmployee
            )[0].id;
            console.log("New ROLE ID: " + selectedRoleId);
            db.query(
              `select id from employee
               where first_name = '${updatedRole.split(" ")[0]}'
                and last_name='${updatedRole.split(" ")[1]}'`,
              (err, result) => {
                const currentId = result[0]["id"];

                db.query(
                  `update employee set role_id = ${selectedRoleId} where id = ${currentId}`,
                  (err, result) => {
                    console.log(`Updated Employee's Role`);
                    promptQuestions();
                  }
                );
              }
            );
          });
        });
    });
  });
};

const roleName = () => {
  db.query(`SELECT name FROM department`, (error, result) => {
    const data = result.map((el) => el.name);
    return inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the role?",
          name: "role",
        },
        {
          type: "input",
          message: "What is the salary of the role?",
          name: "salary",
        },
        {
          type: "list",
          message: "Which department does the role belong to?",
          name: "belong",
          choices: data,
        },
      ])
      .then((answers) => {
        const { role, salary, belong } = answers;
        db.query(
          `SELECT id FROM department where name = '${belong}'`,
          (err, result) => {
            db.query(
              `insert into role (title, salary, department_id)
            values ('${role}', ${parseInt(salary)}, ${result[0].id})`,
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                console.log(`Added ${role} to the database`);
                promptQuestions();
              }
            );
          }
        );
      });
  });
};

const newEmployee = () => {
  db.query(`SELECT id, title FROM role`, (error, result) => {
    const resultData = result.map((el) => ({ value: el.id, name: el.title }));
    db.query(
      `select id, first_name, last_name
        from employee `,
      (error, result) => {
        const empManager = result.map((el) => ({
          value: el.id,
          name: el.first_name + " " + el.last_name,
        }));

        return inquirer
          .prompt([
            {
              type: "input",
              message: "What is the employee's first name?",
              name: "firstName",
            },
            {
              type: "input",
              message: "What is the employee's last name?",
              name: "lastName",
            },
            {
              type: "list",
              message: "What is the employee's role?",
              name: "employeeRole",
              choices: resultData,
            },
            {
              type: "list",
              message: "Who is the employee's manager?",
              name: "newManager",
              choices: [...empManager, "None"],
            },
          ])
          .then((answers) => {
            const { lastName, firstName, employeeRole, newManager } = answers;
            db.query(
              `insert into employee (first_name, last_name, role_id, manager_id)
              values
                 (?, ?,?,?)`,
              [
                firstName,
                lastName,
                employeeRole,
                newManager === "None" ? null : newManager,
              ]
            );
            console.log(`Added ${firstName} ${lastName} to the database`);
            promptQuestions();
          });
      }
    );
  });
};

const promptQuestions = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "todo",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Department",
          "Add Department",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.todo) {
        case "View All Department": {
          db.query(
            "select * from department order by name",
            (error, result) => {
              if (result) {
                console.table(result);
              } else {
                console.log(error);
              }
              promptQuestions();
            }
          );
          break;
        }
        case "View All Roles": {
          db.query(
            `select r.id , r.title , d.name, r.salary
                from role r
                inner join department d
                on r.department_id = d.id`,
            (error, result) => {
              if (error) {
                console.log(error);
              } else {
                console.table(result);
              }
              promptQuestions();
            }
          );
          break;
        }
        case "View All Employees": {
          db.query(
            `select employee.id, employee.first_name, employee.last_name , role.title , department.name ,role.salary ,
            CONCAT( manager.first_name," " , manager.last_name ) as manager
            from employee
           left join role
            on employee.role_id = role.id
            left join department
            on role.department_id =department.id
            left join employee manager
            on manager.id = employee.manager_id`,
            (error, result) => {
              if (error) {
                console.log(error);
              } else {
                console.table(result);
              }
              promptQuestions();
            }
          );
          break;
        }
        case "Add Department": {
          departmentName();

          break;
        }
        case "Add Role": {
          roleName();

          break;
        }
        case "Quit": {
          process.exit();
        }
        case "Add Employee": {
          newEmployee();
          break;
        }
        case "Update Employee Role": {
          newUpdatedRole();
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
promptQuestions();
