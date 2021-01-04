function EmailValidator(Email) {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return emailRegex.test(Email);
}

function PasswordValidator(Password) {
	let PasswordRegex = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{4,16}$/; 
	//La contraseña debe tener al entre 4 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.Puede tener otros símbolos.
    return PasswordRegex.test(Password);
}

function CredentialsValidator(Email, Password){
    return (EmailValidator(Email) && PasswordValidator(Password));
}

module.exports = {"EmailValidator" : EmailValidator, "PasswordValidator" : PasswordValidator, "CredentialsValidator" : CredentialsValidator }