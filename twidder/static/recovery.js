changePasswordRecovery = function (newPassword1,newPassword2){

  if(newPassword1.value != newPassword2.value)
  {
    document.getElementById("output").innerHTML = "<h3>Passwords does not match!</h3>";
  }
  else {
    let request = new XMLHttpRequest();
    request.open("PUT", "/user/put/change_password_recovery", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    const queryString = window.location.href;
    let recovery_token = queryString.substring(queryString.indexOf('=')+1);

    console.log("recovery_token: " + recovery_token);


    let password_change = {
      newPassword: newPassword1.value,
      Rtoken: recovery_token
    }



    request.onreadystatechange = function(){
      if(request.readyState == 4){
        if(request.status == 200)
        {
          document.getElementById("output").innerHTML = "<h3>Password changed!</h3>"
        }
        else if(request.status == 401)
        {
          document.getElementById("output").innerHTML = "<h3>This link has expired!</h3>"
        }
        else if(request.status == 500)
        {
          document.getElementById("output").innerHTML = "<h3>Internal server error!</h3>"
        }

      }

    }
    request.send(JSON.stringify(password_change));
  }
}
function passwordCheck(password1, password2) {
  if(password1.value != password2.value)
  {
    password2.setCustomValidity('Passwords must match');
    return false;
  }
  else {
   password2.setCustomValidity('');
   return true;
  }
}
