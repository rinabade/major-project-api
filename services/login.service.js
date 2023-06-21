const connection = require("../db-Config.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
    name: "login",
    actions: {
        signin: {
            rest: "POST /",
            handler: async (ctx) => {
                const { email, password } = ctx.params;
                try {
                    if (!email || !password) {
                        return { type: "ERROR", status: 400, message: "Missing email or password" };
                    }
                    else {
                        const [result] = await connection.execute(`SELECT * FROM employees WHERE email = ? `, [email]);
                        
                        if(!result[0]){
                            return { type: "ERROR", status: 401, message: "Incorrect email address" };
                        }
                        if (result[0]) {
                            const pass = result[0].password;
                            if (!result.length || !await bcrypt.compare(password, pass)) {
                                return new Error("Incorrect email or password");
                            }
                            else {
                                // console.log((result[0].id));
                                const token = jwt.sign({ employee_id: result[0].employee_id, job_title:result[0].job_title }, process.env.JWT_SECRET, {
                                    expiresIn: process.env.JWT_LIFETIME
                                });
                                
                                // const refreshToken = jwt.sign({employee_id:result[0].employee_id, job_title: result[0].job_title}, process.env.JWT_REFRESH_TOKEN,{
                                //     expiresIn: process.env.JWT_REFRESH_LIFETIME
                                // } );
                                
                                return ({type: "Success", status: 200, message: "You have logged in successfully...", token: token , id:result[0].employee_id , job_title:result[0].job_title });

                            }
                        }
                    }
                }
                catch (error) {
                    throw new Error(error.message);
                }
            }
        }
    }
}