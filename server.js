//DEPENDENCIAS

//Server

const express = require("express");
const server = express();
const cors = require("cors");
const myPublicFiles = express.static("../public");
const Port = 8080;

// const { query } = require("express");
// const { CLIENT_RENEG_WINDOW } = require("tls");
// const { Server } = require("http");

//Otros

const multer = require("multer");
const mysql = require("mysql");
const fetch = require("node-fetch");
const crypto = require ("crypto");
const dotenv = require ("dotenv").config();
const cookieParser = require("cookie-parser");
const base64 = require("base-64");
const SECRET = process.env.SECRET_JWT;
const bodyParser = require("body-parser");
const options = {

	"maxAge": 1000 * 60 * 15 * 4 * 24 * 15, // would expire after 15 days		////// OPTIONS DE JWT//////
	"httpOnly": true, // The cookie only accessible by the web server
	"signed": true // Indicates if the cookie should be signed
};
const Facebook = require("./lib/OauthFacebook");
const facebook = new Facebook();
const fs = require("fs");
const upload = multer();
const JWT = require("./lib/JWT.js");
const {CredentialsValidator, EmailValidator, PasswordValidator} = require("./lib/validator.js");
const {getGoogleAuthURL, getGoogleUser} = require("./lib/OauthGoogle.js");
const {PromiseConnectionDB} = require("./lib/ConnectionDB.js");

//Middlewares

server.use(myPublicFiles);
server.use(bodyParser.urlencoded({"extended":false}));
server.use(cors());
server.use(express.static(__dirname + "/public"));
server.use(bodyParser.urlencoded({extended: true}));

////Others Middlewares/////////
server.use(cookieParser(SECRET));
server.use(bodyParser.json());


////////////////////////////////////////////VALIDATORS//////////////////////////////////////////////////////


// Oauth Google

server.get("/google-redirect", (req, res) => {
	res.redirect(getGoogleAuthURL());
});

server.get("/google-login", async (req, res) => {

    const {code} = req.query;
    
	if (code) {
        const userData = await getGoogleUser(code);

        if(userData){
            // res.send(userData);
            const {id, email, name} = userData;
            const Validated = EmailValidator(email);

            if(Validated){
                PromiseConnectionDB()
                .then((DBconnection) => {
                    //Select siempre devuelve un array, y cuidado con el like, si hay un correo que lo contiene te entran
                    const sql = "SELECT * FROM users U INNER JOIN UsersGoogle UG ON UG.ext_usrid = U.usrid WHERE email = ? OR idGoogle = ?";
                    DBconnection.query(sql, [email,id], (err, result) => {

                        if (err){
                            // res.send({"res" : "-2", "msg" : err})
                            res.redirect(`${process.env.FRONT_URL}/error/-2`)
                            //poner en todos los que se haga la peticion desde el navegador y no desde un fetch
                        } else if (result.length){

                            //Generate JWT
                            const Payload = {
                                "usrid" : result[0].usrid,
                                "name" : result[0].name,
                                "email" : result[0].email,
                                "iat" : new Date()
                            };

                            const jwt = JWT.generateJWT(Payload);
                            const jwtVerified = JWT.verifyJWT(jwt);

                            if(jwtVerified){

                                //Access as administrator
                                res.cookie("JWT", jwt, {"httpOnly" : true})
                                res.send({"res" : "1", "msg" : `${result[0].name} has been found in DB and logged in with google`});
                                // res.redirect(`${process.env.FRONT_URL}/login-successful`)

                            } else {
                                res.send({"res" : "-1", "msg" : "JWT not verified"})
                                // res.redirect(`${process.env.FRONT_URL}/error/-1`)
                            }
                                
                        } else {

                            // res.send({"res" : "2", "msg" : "User Google to fill form", userData})
							const sql = `INSERT INTO User (name, email) VALUES (?, ?)`;
                            DBconnection.query(sql, [name, email], (err, result) => {
								if (err)
									throw err;
								else {

									const idUser = result.insertId; ///este sería el id del ultimo usuario creado
									const sql = `INSERT INTO UserGoogle (ext_idUser,idGoogle) VALUES (?, ?)`;
									DBconnection.query(sql, [idUser, id], (err, result) => {
										if (err)
											throw err;
										else {

											const Payload = {
												"idUser": idUser,
												"Name": name,
												"Email": email,
												"iat" : new Date()
												// "ip": req.ip
											};
											res.cookie("jwt", JWT.generateJWT(Payload), options)
											res.send({ "res" : "1", "msg": "New user has been created." });

										}
									});
								}
							});
						}
                        DBconnection.end();
                    });
                })
                .catch(err => res.send({"res" : "-3", "msg" : err}))
                // .catch(() => res.redirect(`${process.env.FRONT_URL}/error/-3`))
            }

        } else {
            res.send({"res" : "-4", "msg" : "No userData"});
            // res.redirect(`${process.env.FRONT_URL}/error/-4`)
        }

	} else {
        res.send({"res" : "-5", "msg" : "No code"})
        // res.redirect(`${process.env.FRONT_URL}/error/-5`)
    }
});

server.get("/facebook-redirect", (req, res) => {
	res.redirect(facebook.getRedirectUrl());
});

server.get("/facebook-login", async (req, res) => {

	const Token = await (facebook.getOauthToken(req.query.code, req.query.state));
	const data = await facebook.getUserInfo(Token, ["name", "email"])

	const { id, name, email } = userData;

	if(id && name && email){
		const Validated = EmailValidator(email);

		if(Validated){
			connection.query(`SELECT * FROM User WHERE Email ="${email}"`,(err,result)=> {
				if(err){
					throw error
				}
			})
		}
	
	
		console.log("facebook data: ", data);

	}

});

////COMPROBACIÓN DEL JWT/////
server.get("/jwt", (req, res) => {

	const Payload = {

		"userName": "Admin",
		"iat": new Date(),
		"role": "Admin",
		"ip": req.ip
	};
	const JWT = generateJWT(Payload);
	res.cookie("jwt", JWT, {"httpOnly": true});
	res.send("Hola Mundo");
});

/////////////////CAMERA STUFF//////////////////////

function getDate() {
	let date = new Date();

	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}`
}

server.post("/upload", upload.none(), (req, res) => {
    const {img} = req.body;
    var base64Data = img.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(`./public/imgs/${getDate()}.png`, base64Data, "base64", (e) => console.log(e));
    res.send({"msg": "Image stored"});
})

///REGISTER///
server.post("/register", (req, res) => {

	let newUser = req.body;
	console.log(newUser);

    if(newUser.Name && newUser.Email && newUser.Password){
		let validated = CredentialsValidator(newUser.Email, newUser.Password);
		if(validated){
			connection.query(`SELECT * FROM User WHERE Email = "${newUser.Email}";`, function (err, result){ 
				console.log(result)
				if(err){
					console.log(err);
					return;
				}
				
				if (!result.length){//Si buscamos el email y da un array vacio =>registramos user
					
					connection.query(`INSERT INTO User (Name,Password,Email,Avatar) VALUES ("${newUser.Name}","${newUser.Password}","${newUser.Email}","${newUser.Avatar}");`)
					
					const Payload = {
						"userName": newUser.Name,
						"userPassword": newUser.Password,
						"userEmail": newUser.Email,
						"userAvatar":newUser.Avatar,
								"iat": new Date(),
								"role": "User",
								"ip": req.ip
							};
					
					res.cookie("jwt", generateJWT(Payload),options).send({"msg": "New user has been created."});
				}else{
					res.send("User name or Email already exists")
				}
			})
		}else{
			res.send("Usuario o Contraseña NO válidos")
		}	
	}else{
		res.send("Please, Complete Credentials");
		connection.end();
		
	}
	
})
///LOGIN///
server.post("/login", (req, res) => {
	 
	let {email, psw} = req.body;

	if(email && psw){

		const validated = CredentialsValidator(email, psw);

		if(validated){

			PromiseConnectionDB()
			.then(DBconnection => {

				const sql = `SELECT U.* FROM users AS U JOIN PersonalUsers AS PU ON U.usrid = PU.ext_usrid WHERE PU.psw = ? AND U.email = ?`;
				DBconnection.query(sql, [psw, email], (err, result) => {
					if(err){
						res.send({"res" : "-1", "msg" : err})
					} else if(result.length){

						const Payload = {
							"usrid" : result[0].usrid,
							"name" : result[0].name,
							"email": result[0].email,
							"iat": new Date(),
							// "role": "User",
							// "ip":req.ip
						};

						res.cookie("jwt", generateJWT(Payload),options)
						res.send({"res" : "1", "msg": "Logged¡", result});

					} else {
						res.send({"res" : "-2", "msg" : "user not registered yet"})
					}
					DBconnection.end();
				});
			})
			.catch(e => res.send({"res" : "-3", "msg" : "error in database", "e" : console.error(e)}))

		} else {
			res.send({"res" : "-4", "msg" : "Error in credentials"})
		}

	} else {
		res.send({"res" : "-5", "msg" : "no req.body"})
	}
});

///SEARCH PRODUCTS/// 

server.get("/get-mask-dashboard", (req, res) => {

	PromiseConnectionDB()
	.then(DBconnection => {

		const sql = `SELECT * FROM maskdata`;
		DBconnection.query(sql, (err, result) => {
			if(err)
				res.send({"res" : "-1", "msg" : err});

			else {
				res.send({"res" : "1", "msg" : "data found", result});
			}
			DBconnection.end();	
		})
	})
	.catch(e => res.send({"res" : "-2", "msg" : "error in database", e}));
})
///SEARCH PRODUCT DETAILS///
server.get("/searchProducts/Details",(req, res) => {
	// const {search} = req.query;
	console.log({search})
	SQLquery(`SELECT * FROM Products WHERE idProduct = ${search};`,[search])
			.then((result)=>{
					console.log(result)
					const Product = {
							"Name" : result[0].Name,
							"img": result[0].Picture,
							"Brand": result[0].Brand,
							"Description": result[0].Description,
							"Ingredients" : result[0].Ingredients
					}
					console.log(Product);
					res.send(Product)
			});
	connection.end();					
})

// ENDPOINT BUSCADOR MASCARILLAS

server.get("/search", (req, res) => {
    connection.query(`SELECT * FROM maskdata`, (err, result) => {
        if(err) {
            res.send(err);
        }else {
            const Maskdata = result.map (maskdata => {
                return {
                    "Name": maskdata.name,
                    "Type": maskdata.type,
                    "Reusable": maskdata.reusable,
                    "Price": maskdata.price,
                    "Certificate": maskdata.certificate
                }
            });
            res.send(Maskdata);
        }
    })
        connection.end();
});

// ENDPOINT MOSTRAR INFORMACION MASCARILLAS

server.get("/show-info", (req, res) => {
    connection.query("SELECT")
})
///LISTA DE PRODUCTOS DEL HERBOLARIO SELECCIONADO ///

server.get("/searchRetailer/Products", (req, res) => {
	const {search} = req.query
	SQLquery(`SELECT p.Name, p.Brand, p.Category , p.Picture FROM Retailer AS r JOIN Stock AS s ON r.idRetailer = s.id_Retailer JOIN Products AS p ON p.idProduct = s.id_Product WHERE r.idRetailer = ?`,[search])
	.then(
	(err, result) => {
		if(err) {
			res.send(err);
		} else {
			const products = result.map(products => {
				return {
					"Name": products.Name,
					"Brand": products.Brand,
					"Category": products.Category,
					"Picture":products.Picture
				}
			});

			res.send(products);
		}
	})
	connection.end();
})

////USER PROFILE///
server.get("/User",(req, res) => {
	const {search} = req.query;
	SQLquery(`SELECT * FROM User WHERE Email = "${search}";`,[search])
			.then((result)=>{
					console.log(result)
					res.send(result)
			});
	connection.end();					
})

///EDIT USER PROFILE///	
server.put("/User/Edit/:idUser",(req, res)=>{
	const idUser = req.params.idUser;
	console.log(idUser);
	if(idUser){
	connection.query(`SELECT * FROM User WHERE idUser = ${idUser};`,(err, result)=>{
		if(err){
			res.send(err);
		}
		if(result){
			console.log(result);
			const changes = req.body
			const UserChange ={
				"idUser": idUser,
				"Name": changes.Name,
				"Surname": changes.Surname, 
				"Password": changes.Password, 
				"Email": changes.Email,
				"Avatar": changes.Avatar ? `"${changes.Avatar}"` : `NULL`
			}
		if(changes.Name && changes.Surname && changes.Password && changes.Email){
			let validated = CredentialsValidator(changes.Email, changes.Password);
			if(validated){

				connection.query(`UPDATE User SET  Name = "${changes.Name}",Surname ="${changes.Surname}", Password ="${changes.Password}", Email ="${changes.Email}", Avatar = ${UserChange.Avatar} WHERE idUser = ${idUser};`)

				const Payload = {
				"userName": changes.Name,
				"userSurname": changes.Surname,
				"userPassword": changes.Password,
				"userEmail": changes.Email,
				"userAvatar":changes.Avatar,
				"iat": new Date(),
				"role": "User",
				"ip": req.ip
				};
				res.cookie("jwt", generateJWT(Payload),options).send({"msg": "User has been changed."});
			
				}else{
				res.send("User or password NOT valid");
				}
		}else{
			res.send("User name or Email don't exists")
		}	
		}connection.end();
	})
	

	}	
})
	
///U SER'S FAVS LIST //

server.get("/Favs",(req,res)=>{
	const {search} = req.query
	SQLquery(`SELECT p.Name, p.Brand, p.Category, p.Picture FROM Products AS p JOIN Favs as f ON p.idProduct = f.idProduct WHERE f.idUser = ?`,[search])
		.then(
			(err,result)=>{
				if(err){
					res.send(err);
				}else{
					const favs = result.map(favs =>{
						return {
							"Name":favs.Name,
							"Brand": favs.Brand, 
							"Category": favs.Category,
							"Picture": favs.Picture
						}
					});
					res.send(favs)
				}
			}
		)
	connection.end();
})

///Delete FAV ////

server.get("/DeleteFav", async (req, res)=>{
	const {user,favid} = req.query;
	SQLquery(`DELETE FROM Favs WHERE idUser = ? AND idProduct= ?`,[user,favid])
		.then(
			(err,result)=>{
				if(err){
					res.send(err);}
				if(result){
					res.send("Fav Deleted")
				}
			})
	connection.end();
})

///SHOW USER'S FOLDERS FAVS///

server.get("/ShowUserFolders", async (req,res)=>{
	const {userid} = req.query;
	SQLquery('SELECT * FROM FolderFavs WHERE idUser =?',[userid])
		.then(
			(err,result)=>{
				if(err){
					res.send(err);
				}
				if(result){
					res.send(result);
				}
			})
	connection.end();
})

// server.get("/ShowFolderContent", async (req,res)=>{
// 	const {}
// })
			
//////////////////////////////////////////////
////////LISTENING PORT/////////

server.listen(Port,() => {
    console.log(`Server Listening on port ${Port}`);
})